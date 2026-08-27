import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Restore session when app starts
 * Try to get new access token using refresh token from cookie
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { restoreSession } = useAuth();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user')
        
        if (savedUser) {
          await restoreSession();
        } else {
          setIsRestoring(false);
          return;
        }
      } catch (error) {
        // Silent catch - expected when user is not logged in
      } finally {
        setIsRestoring(false);
      }
    };

    initAuth();
  }, []);

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return <>{children}</>;
};
