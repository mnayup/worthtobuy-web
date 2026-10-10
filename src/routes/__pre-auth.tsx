import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

export default function PreAuthLayout() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
