import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail } from 'lucide-react';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function AdminLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
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
      if (user.role !== 'owner') {
        setError('This account does not have owner access.');
        return;
      }
      setSession(token, user);
      toast.success('Welcome back, chef!');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-stone-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Owner Console</h1>
          <p className="mt-1 text-sm text-stone-400">Sign in to manage your menu and orders.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="ad-email" className="mb-1.5 block text-sm font-medium text-stone-300">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                id="ad-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-500 focus:border-brand-500"
                placeholder="owner@saffronsage.test"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ad-pass" className="mb-1.5 block text-sm font-medium text-stone-300">Password</label>
            <PasswordInput
              dark
              id="ad-pass"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 py-2.5 text-sm text-white placeholder-stone-500 focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'Sign in to console'}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-sm text-stone-500 hover:text-stone-300">
          ← Back to the restaurant site
        </Link>
      </motion.div>
    </div>
  );
}
