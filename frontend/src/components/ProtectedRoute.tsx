import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Wraps routes that require a signed-in user (dashboard, checkout).
// Unauthenticated visitors are redirected to login with a "next" target.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
