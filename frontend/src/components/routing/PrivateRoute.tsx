import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, type ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { state, loadUser } = useAuth();
  const { isAuthenticated, loading, user } = state;

  // Try to load user if we have a token but no user data
  useEffect(() => {
    if (!user && !loading && localStorage.getItem('token')) {
      loadUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
