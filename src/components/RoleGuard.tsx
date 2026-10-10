import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

interface RoleGuardProps {
  roles?: string[];
  permission?: string;
  children: ReactNode;
}

export function RoleGuard({ roles, permission, children }: RoleGuardProps) {
  const { user, hasPermission } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin / Owner always bypasses
  if (user.role === 'OWNER') {
    return <>{children}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }



  return <>{children}</>;
}
