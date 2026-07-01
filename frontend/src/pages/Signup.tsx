import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/ui/Spinner';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { OwnerLoginCallout } from '../components/auth/OwnerLoginCallout';
import { useConfigStore } from '../store/configStore';

export function Signup() {
  const setSession = useAuthStore((s) => s.setSession);
  const hasGoogle = useConfigStore((s) => !!s.config?.googleClientId);
  const navigate = useNavigate();
  const location = useLocation();
  const next = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.signup(name, email, password);
      setSession(token, user);
      toast.success('Account created — welcome!');
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-7">
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">Save addresses, track orders, and reorder in a tap.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label>
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-10"
                placeholder="Jane Doe"
              />
            </div>
          </div>
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
            <PasswordInput
              id="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'Create account'}
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
          Already have an account?{' '}
          <Link to="/login" state={{ from: next }} className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>

        <OwnerLoginCallout />
      </motion.div>
    </div>
  );
}
