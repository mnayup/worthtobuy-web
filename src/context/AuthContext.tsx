import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../lib/api';

type AuthValue = {
  user: User | null;
  permissions: string[];
  login: (token: string, user: User, permissions?: string[]) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  hasPermission: (moduleOrKey: string, action?: string) => boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('jastipflow_user') || 'null');
    } catch {
      return null;
    }
  });

  const [permissions, setPermissions] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('jastipflow_permissions') || '[]');
    } catch {
      return [];
    }
  });

  const login = useCallback((token: string, nextUser: User, nextPermissions?: string[]) => {
    const perms = nextPermissions || nextUser.permissions || [];
    localStorage.setItem('jastipflow_token', token);
    localStorage.setItem('jastipflow_user', JSON.stringify({ ...nextUser, permissions: perms }));
    localStorage.setItem('jastipflow_permissions', JSON.stringify(perms));
    setUser({ ...nextUser, permissions: perms });
    setPermissions(perms);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jastipflow_token');
    localStorage.removeItem('jastipflow_user');
    localStorage.removeItem('jastipflow_permissions');
    setUser(null);
    setPermissions([]);
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem('jastipflow_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasPermission = useCallback(
    (moduleOrKey: string, action?: string): boolean => {
      if (!user) return false;
      // Superadmin / Owner has absolute access
      if (user.role === 'OWNER') return true;
      if (permissions.includes('*') || permissions.includes('*:*')) return true;

      if (action) {
        // e.g. hasPermission('orders', 'create')
        const target = `${moduleOrKey}:${action}`;
        return permissions.includes(target) || permissions.includes(`${moduleOrKey}:*`);
      }

      // If key contains ':', check direct key e.g. 'orders:create'
      if (moduleOrKey.includes(':')) {
        const [mod] = moduleOrKey.split(':');
        return permissions.includes(moduleOrKey) || permissions.includes(`${mod}:*`);
      }

      // Check if module view permission is granted or if any action in module is granted
      return (
        permissions.includes(`${moduleOrKey}:view`) ||
        permissions.includes(`${moduleOrKey}:*`) ||
        permissions.includes(moduleOrKey) ||
        permissions.some((p) => p.startsWith(`${moduleOrKey}:`))
      );
    },
    [user, permissions]
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const perms = res.data.permissions || [];
        setUser(res.data);
        setPermissions(perms);
        localStorage.setItem('jastipflow_user', JSON.stringify(res.data));
        localStorage.setItem('jastipflow_permissions', JSON.stringify(perms));
      }
    } catch (err) {
      console.error('Failed to refresh user session:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      login,
      logout,
      updateUser,
      hasPermission,
      refreshUser,
    }),
    [user, permissions, login, logout, updateUser, hasPermission, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
};
