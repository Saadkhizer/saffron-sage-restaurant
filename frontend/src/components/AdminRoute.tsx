import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Guards the owner console: requires a signed-in user with the 'owner' role.
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || user?.role !== 'owner') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
