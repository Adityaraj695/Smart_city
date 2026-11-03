import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createAnalyzeRouter } from './analyze.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'civicpulse.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    role          TEXT NOT NULL DEFAULT 'Urban Planner',
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS geojson_files (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    size_label    TEXT,
    feature_count INTEGER NOT NULL DEFAULT 0,
    geojson       TEXT NOT NULL,
    uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const SESSION_DAYS = 7;
const COOKIE = 'civicpulse_session';

// Login attempts were unlimited. In-memory and per-process, which is the right
// size for this deployment; a multi-instance one needs a shared store.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

function tooManyAttempts(key) {
  const now = Date.now();
  const rec = loginAttempts.get(key);
  if (!rec || now - rec.first > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { first: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > LOGIN_MAX_ATTEMPTS;
}

function clearAttempts(key) {
  loginAttempts.delete(key);
}

// Expired sessions were never removed, so the table grew without bound.
function pruneSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}

const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  // A malformed stored hash used to throw out of here: timingSafeEqual raises
  // RangeError when the buffers differ in length, which Express turns into a
  // 500. A failed comparison is a failed login, not a server fault.
  try {
    const [salt, hash] = String(stored).split(':');
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const candidate = crypto.scryptSync(password, salt, expected.length || 64);
    if (candidate.length !== expected.length) return false;
    return crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

const publicUser = (u) => ({ id: u.id, fullName: u.full_name, email: u.email, role: u.role });

function startSession(res, userId) {
  pruneSessions();
  const token = crypto.randomBytes(32).toString('hex');
  const maxAgeMs = SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(hashToken(token), userId, Date.now() + maxAgeMs);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', maxAge: maxAgeMs });
}

function readCookie(req, name) {
  const match = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function requireAuth(req, res, next) {
  const token = readCookie(req, COOKIE);
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  const row = db.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`
  ).get(hashToken(token), Date.now());
  if (!row) return res.status(401).json({ error: 'Session expired' });
  req.user = row;
  next();
}

export function createApi() {
  const api = express.Router();
  api.use(express.json({ limit: '50mb' }));

  api.post('/signup', (req, res) => {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // The read-then-write check below is a courtesy, not the guarantee: two
    // concurrent signups can both pass it. The UNIQUE constraint is the real
    // guard, so the insert is wrapped to turn its error into the 409 the
    // client expects rather than an HTML 500.
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.trim())) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    let info;
    try {
      info = db.prepare('INSERT INTO users (full_name, email, role, password_hash) VALUES (?, ?, ?, ?)')
        .run(fullName.trim(), email.trim(), role?.trim() || 'Urban Planner', hashPassword(password));
    } catch (err) {
      if (String(err.message || '').includes('UNIQUE')) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw err;
    }
    startSession(res, Number(info.lastInsertRowid));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ user: publicUser(user) });
  });

  api.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    const key = `${req.ip}:${String(email || '').toLowerCase().trim()}`;
    if (tooManyAttempts(key)) {
      return res.status(429).json({
        error: 'Too many sign-in attempts. Try again in a few minutes.'
      });
    }
    const user = email && db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim());
    if (!user || !password || !verifyPassword(String(password), user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    clearAttempts(key);
    startSession(res, user.id);
    res.json({ user: publicUser(user) });
  });

  api.post('/logout', (req, res) => {
    const token = readCookie(req, COOKIE);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
    res.clearCookie(COOKIE);
    res.json({ ok: true });
  });

  api.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

  // Seam for an external analysis model. See server/analyze.js for the contract.
  api.use('/analyze', requireAuth, createAnalyzeRouter());

  // Saved GeoJSON files (per user)
  api.get('/files', requireAuth, (req, res) => {
    const files = db.prepare(
      `SELECT id, name, size_label AS sizeLabel, feature_count AS featureCount, uploaded_at AS uploadedAt
       FROM geojson_files WHERE user_id = ? ORDER BY id DESC`
    ).all(req.user.id);
    res.json({ files });
  });

  api.post('/files', requireAuth, (req, res) => {
    const { name, sizeLabel, geojson } = req.body || {};
    if (!name || !geojson || !Array.isArray(geojson.features)) {
      return res.status(400).json({ error: 'A file name and GeoJSON FeatureCollection are required' });
    }
    const info = db.prepare(
      'INSERT INTO geojson_files (user_id, name, size_label, feature_count, geojson) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, String(name), sizeLabel || null, geojson.features.length, JSON.stringify(geojson));
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  api.get('/files/:id', requireAuth, (req, res) => {
    const row = db.prepare('SELECT * FROM geojson_files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'File not found' });
    res.json({
      id: row.id,
      name: row.name,
      sizeLabel: row.size_label,
      featureCount: row.feature_count,
      uploadedAt: row.uploaded_at,
      geojson: JSON.parse(row.geojson)
    });
  });

  api.delete('/files/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM geojson_files WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ ok: true });
  });

  return api;
}

export function startApiServer(port = 3001) {
  const app = express();
  app.use('/api', createApi());
  return new Promise((resolve) => app.listen(port, () => {
    console.log(`CivicPulse API listening at http://localhost:${port}`);
    resolve();
  }));
}
