import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles, ShoppingBag, Globe, PlaneTakeoff, ShieldCheck, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { useAuth } from '~/context/AuthContext';
import { LoginForm } from './components/login-form';
import { validateLoginForm } from './helpers/login-validation';
import type { LoginFormValues } from './types';

export default function LoginRoute() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA state
  const [mfaData, setMfaData] = useState<{ tempToken: string; name?: string; username?: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(values: LoginFormValues) {
    const validationError = validateLoginForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        login: values.login,
        password: values.password,
      });

      if (response.data.mfaRequired) {
        setMfaData({
          tempToken: response.data.tempToken,
          name: response.data.user?.name,
          username: response.data.user?.username,
        });
      } else if (response.data.token) {
        login(response.data.token, response.data.user, response.data.permissions);
        navigate('/dashboard');
      }
    } catch (caught) {
      setError(errorMessage(caught) || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaData?.tempToken || !otpCode.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/mfa/verify', {
        tempToken: mfaData.tempToken,
        code: otpCode.trim(),
      });

      if (response.data.token) {
        login(response.data.token, response.data.user, response.data.permissions);
        navigate('/dashboard');
      }
    } catch (caught) {
      setError(errorMessage(caught) || 'Kode OTP atau recovery code tidak valid.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-950 p-3 sm:p-6 flex items-center justify-center">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.1fr_.9fr] border border-brand-200/50">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-50 via-white to-rose-50/50 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-honey-100/60 to-rose-100/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-36 -left-16 h-96 w-96 rounded-full bg-gradient-to-tr from-cherry-100/50 to-indigo-100/40 blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cherry-500 to-rose-600 text-white shadow-md shadow-cherry-500/25">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-brand-900">WORTHTOBUY</p>
              <p className="text-xs font-bold text-cherry-600">Personal Shopper & Jastip HQ</p>
            </div>
          </div>

          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-cherry-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-cherry-700 shadow-xs backdrop-blur">
              <Sparkles size={14} className="text-cherry-500" />
              Smart Jastip & Shopping Operations
            </span>
            <h1 className="mt-5 text-5xl font-black leading-[1.08] tracking-[-.04em] text-brand-900">
              Personal shopping made organized & effortless.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-brand-600 font-medium">
              Oversee international & domestic events, orders, customer deposits, automated service fees, invoices, and parcel tracking.
            </p>

            <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {[
                { title: 'Automated & Custom Fees', icon: Sparkles },
                { title: 'One-Click Invoices & WhatsApp', icon: Globe },
                { title: 'Two-Factor MFA Security', icon: ShieldCheck },
                { title: 'Dynamic Role Permissions', icon: KeyRound },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2.5 rounded-xl border border-brand-100/80 bg-white/70 p-2.5 text-xs font-bold text-brand-800 shadow-2xs backdrop-blur-xs"
                >
                  <div className="rounded-lg bg-cherry-50 p-1.5 text-cherry-600">
                    <item.icon size={15} />
                  </div>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-brand-200/60 pt-4 text-xs font-semibold text-brand-400">
            <span>© {new Date().getFullYear()} WORTHTOBUY</span>
            <span>Enterprise Security Enabled</span>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-16">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition"
            >
              <ArrowLeft size={14} />
              Kembali ke Beranda Customer
            </Link>
          </div>
          {mfaData ? (
            <div className="w-full max-w-md animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setMfaData(null);
                  setOtpCode('');
                  setError('');
                }}
                className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-900 transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Form Login
              </button>

              <div className="flex items-center gap-2 text-cherry-600 mb-2">
                <ShieldCheck size={28} />
                <span className="text-xs font-black uppercase tracking-wider">Two-Factor Authentication</span>
              </div>
              <h2 className="text-2xl font-black text-brand-900 tracking-tight">Masukkan Kode OTP 2FA</h2>
              <p className="mt-2 text-xs text-brand-600 leading-relaxed">
                Akun <strong>@{mfaData.username}</strong> terlindungi dengan MFA. Buka aplikasi Authenticator (Google Authenticator / 1Password) dan masukkan 6-digit kode OTP atau Recovery Code cadangan Anda.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-cherry-200 bg-cherry-50/90 p-3 text-xs font-bold text-cherry-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyMfa} className="mt-6 space-y-4">
                <div>
                  <label className="label">Kode 6-Digit OTP / Recovery Code</label>
                  <input
                    type="text"
                    autoFocus
                    maxLength={16}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="Contoh: 123456"
                    className="input text-center font-mono text-xl tracking-widest font-black uppercase"
                    required
                  />
                  <p className="mt-1.5 text-[11px] text-brand-400">
                    Masukkan 6-digit kode numerik atau 8-digit kode recovery pemulihan jika ponsel Anda hilang.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpCode.trim()}
                  className="btn-primary w-full py-3.5 text-sm font-black shadow-lg shadow-cherry-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk Dashboard'}
                </button>
              </form>
            </div>
          ) : (
            <LoginForm error={error} loading={loading} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
