import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminConsole } from './pages/admin/AdminConsole';
import { Home } from './pages/Home';
import { MenuPage } from './pages/MenuPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderTracking } from './pages/OrderTracking';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

import { useConfigStore } from './store/configStore';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/endpoints';
import { Spinner } from './components/ui/Spinner';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Owner console — separate chrome, no public navbar/footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminConsole /></AdminRoute>} />

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="order/:id/confirmed" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="order/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const { config, loading, load } = useConfigStore();
  const applyTheme = useThemeStore((s) => s.apply);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    load();
    applyTheme();
  }, [load, applyTheme]);

  // Re-validate a persisted session on load; client.ts clears it on a 401.
  useEffect(() => {
    if (token) {
      authApi.me().then(({ user }) => setUser(user)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !config) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-50 dark:bg-stone-950">
        <Spinner className="h-8 w-8 text-brand-600" />
      </div>
    );
  }

  const app = (
    <>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-white !text-stone-900 dark:!bg-stone-800 dark:!text-stone-100',
          style: { borderRadius: '12px' },
        }}
      />
    </>
  );

  // Only mount the Google provider when a client id is configured.
  return config.googleClientId ? (
    <GoogleOAuthProvider clientId={config.googleClientId}>{app}</GoogleOAuthProvider>
  ) : (
    app
  );
}
