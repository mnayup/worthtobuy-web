import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, User, Loader2 } from 'lucide-react';
import type { LoginFormValues } from '../types';

interface LoginFormProps {
  initialLogin?: string;
  error?: string;
  loading?: boolean;
  onSubmit: (values: LoginFormValues) => void;
}

export function LoginForm({
  initialLogin = 'owner',
  error,
  loading = false,
  onSubmit,
}: LoginFormProps) {
  const [login, setLogin] = useState(initialLogin);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ login: login.trim(), password });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <img src="/worthtobuy-logo.png" alt="WORTHTOBUY" className="w-44" />
      </div>
      <p className="text-xs font-black uppercase tracking-[.18em] text-cherry-600">Welcome Back</p>
      <h2 className="mt-2 text-3xl font-black tracking-[-.035em] text-brand-900">Sign in to your dashboard</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-500">
        Enter your username or email address and password to access your workspace.
      </p>

      {error && (
        <div className="mt-5 rounded-2xl border border-cherry-200 bg-cherry-50/80 p-3.5 text-sm font-bold text-cherry-700 shadow-sm animate-rise">
          {error}
        </div>
      )}

      <div className="mt-7 space-y-4">
        <div>
          <label className="label">Username or Email</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
            <input
              type="text"
              className="input !pl-10"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="e.g. owner or user@worthtobuy.local"
              required
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="input !pl-10 !pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="btn-primary w-full py-3.5 text-sm font-black shadow-lg shadow-cherry-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in to WORTHTOBUY'}
        </button>
      </div>

      <div className="mt-7 rounded-2xl border border-brand-200/70 bg-brand-50/70 p-4 text-xs leading-relaxed text-brand-600 shadow-xs">
        <p className="font-extrabold text-brand-900">Default Credentials</p>
        <p className="mt-1">
          Username: <strong className="text-brand-900">owner</strong> (atau email <strong>owner@worthtobuy.local</strong>)
        </p>
        <p className="mt-0.5">
          Password: <strong>GantiPassword123!</strong>
        </p>
      </div>
    </form>
  );
}
