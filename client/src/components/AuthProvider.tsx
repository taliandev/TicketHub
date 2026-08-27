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
      // Try to restore session silently (no error if fails)
      await restoreSession();
      setIsRestoring(false);
    };

    initAuth();
  }, []); // Only run once on mount

  // Show loading spinner while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return <>{children}</>;
};
