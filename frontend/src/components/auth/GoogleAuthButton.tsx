import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';

// Only renders when a Google client id is configured on the server.
// Verification of the credential happens server-side via /api/auth/google.
export function GoogleAuthButton({ next }: { next: string }) {
  const clientId = useConfigStore((s) => s.config?.googleClientId);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  if (!clientId) return null;

  return (
    <GoogleLogin
      onSuccess={async (cred) => {
        if (!cred.credential) return;
        try {
          const { token, user } = await authApi.google(cred.credential);
          setSession(token, user);
          toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
          navigate(next, { replace: true });
        } catch {
          toast.error('Google sign-in failed');
        }
      }}
      onError={() => toast.error('Google sign-in was cancelled')}
      theme="outline"
      width="320"
    />
  );
}
