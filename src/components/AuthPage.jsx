import React, { useState } from 'react';
import { Building2, Mail, Lock, User, Briefcase, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', role: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user } = isSignup ? await api.signup(form) : await api.login(form);
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-neutral-900 text-lg leading-tight">CivicPulse</h1>
            <p className="text-xs text-neutral-500 font-medium">Smart City Analytics</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-5">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === m ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isSignup && (
              <>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input className={inputClass} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
                </div>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input className={inputClass} placeholder="Role (e.g. Urban Planner)" value={form.role} onChange={set('role')} />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className={inputClass} type="email" placeholder="Email address" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className={inputClass}
                type="password"
                placeholder={isSignup ? 'Password (min. 8 characters)' : 'Password'}
                value={form.password}
                onChange={set('password')}
                required
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignup ? 'Create Account' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Only registered users can access the platform
        </p>
      </div>
    </div>
  );
}
