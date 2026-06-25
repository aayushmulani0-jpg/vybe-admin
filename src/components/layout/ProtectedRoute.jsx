import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

export default function ProtectedRoute({ children }) {
  const { user, token } = useAdminAuthStore();
  const location = useLocation();

  if (!user || !token) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
