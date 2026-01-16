import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const MagicLinkCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmAuth = async () => {
      const token = searchParams.get('token');
      const email = localStorage.getItem('pending_auth_email');

      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid magic link. Token is missing.');
        return;
      }

      if (!email) {
        setStatus('error');
        setErrorMessage('Session expired. Please request a new magic link.');
        return;
      }

      try {
        const response = await authApi.confirmSignin(email, token);
        const authToken = response.data?.token || response.data?.access_token;
        
        if (authToken) {
          setToken(authToken);
          localStorage.removeItem('pending_auth_email');
          setStatus('success');
          
          // Navigate to dashboard after a brief delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed. Invalid response from server.');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Authentication failed. Please try again.');
      }
    };

    confirmAuth();
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Verifying your magic link...</h1>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Successfully authenticated!</h1>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Authentication Failed</h1>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Return to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MagicLinkCallback;
