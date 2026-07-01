import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/ui/Spinner';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { useConfigStore } from '../store/configStore';

export function Login() {
  const setSession = useAuthStore((s) => s.setSession);
  const hasGoogle = useConfigStore((s) => !!s.config?.googleClientId);
  const navigate = useNavigate();
  const location = useLocation();
  const next = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.login(email, password);
      setSession(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(next, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-7"
      >
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">Sign in to track orders and check out faster.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'Sign in'}
          </button>
        </form>

        {hasGoogle && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
              OR
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            </div>
            <div className="flex justify-center">
              <GoogleAuthButton next={next} />
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{' '}
          <Link to="/signup" state={{ from: next }} className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
