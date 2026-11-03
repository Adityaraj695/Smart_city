async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    credentials: 'same-origin',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.error === undefined && res.status >= 500) {
    throw new Error('Cannot reach the server. Start the app with "npm start" so the database API is running.');
  }
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request('/me'),
  signup: (body) => request('/signup', { method: 'POST', body }),
  login: (body) => request('/login', { method: 'POST', body }),
  logout: () => request('/logout', { method: 'POST' }),
  listFiles: () => request('/files'),
  getFile: (id) => request('/files/' + id),
  saveFile: (body) => request('/files', { method: 'POST', body }),
  deleteFile: (id) => request('/files/' + id, { method: 'DELETE' })
};
