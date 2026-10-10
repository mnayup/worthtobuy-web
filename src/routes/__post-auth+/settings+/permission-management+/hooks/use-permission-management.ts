import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { api, errorMessage } from '~/lib/api';
import { useAuth } from '~/context/AuthContext';
import type { ModuleDef, RoleItem } from '../types';

export function usePermissionManagement() {
  const { refreshUser } = useAuth();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalog, setCatalog] = useState<ModuleDef[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [canViewProfit, setCanViewProfit] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  const isOwnerRole = selectedRole?.name === 'OWNER';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, catRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/catalog'),
      ]);
      setRoles(rolesRes.data);
      setCatalog(catRes.data);

      if (rolesRes.data.length > 0 && selectedRoleId === null) {
        const first = rolesRes.data[0];
        setSelectedRoleId(first.id);
        setActivePermissions(Array.isArray(first.permissions) ? first.permissions : []);
        setRoleDescription(first.description || '');
        setCanViewProfit(Boolean(first.canViewProfit));
      }
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Failed to load permissions catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRole = (role: RoleItem) => {
    setSelectedRoleId(role.id);
    setActivePermissions(Array.isArray(role.permissions) ? role.permissions : []);
    setRoleDescription(role.description || '');
    setCanViewProfit(Boolean(role.canViewProfit));
  };

  const allPermissionKeys = useMemo(() => {
    const keys: string[] = [];
    catalog.forEach((mod) => {
      mod.actions.forEach((act) => {
        keys.push(`${mod.key}:${act.key}`);
      });
    });
    return keys;
  }, [catalog]);

  const isPermissionChecked = (permKey: string) => {
    if (isOwnerRole) return true;
    if (activePermissions.includes('*') || activePermissions.includes('*:*')) return true;
    return activePermissions.includes(permKey);
  };

  const togglePermission = (permKey: string) => {
    if (isOwnerRole) return;
    setActivePermissions((prev) => {
      if (prev.includes('*')) {
        return allPermissionKeys.filter((k) => k !== permKey);
      }
      if (prev.includes(permKey)) {
        return prev.filter((k) => k !== permKey);
      }
      return [...prev, permKey];
    });
  };

  const toggleModulePermissions = (moduleDef: ModuleDef) => {
    if (isOwnerRole) return;
    const moduleKeys = moduleDef.actions.map((act) => `${moduleDef.key}:${act.key}`);
    const allChecked = moduleKeys.every((k) => isPermissionChecked(k));

    setActivePermissions((prev) => {
      const currentList = prev.includes('*') ? [...allPermissionKeys] : [...prev];
      if (allChecked) {
        return currentList.filter((k) => !moduleKeys.includes(k));
      }
      return Array.from(new Set([...currentList, ...moduleKeys]));
    });
  };

  const toggleGroupPermissions = (groupModules: ModuleDef[]) => {
    if (isOwnerRole) return;
    const groupKeys: string[] = [];
    groupModules.forEach((m) => {
      m.actions.forEach((a) => groupKeys.push(`${m.key}:${a.key}`));
    });

    const allChecked = groupKeys.every((k) => isPermissionChecked(k));

    setActivePermissions((prev) => {
      const currentList = prev.includes('*') ? [...allPermissionKeys] : [...prev];
      if (allChecked) {
        return currentList.filter((k) => !groupKeys.includes(k));
      }
      return Array.from(new Set([...currentList, ...groupKeys]));
    });
  };

  const handleGrantAll = () => {
    if (isOwnerRole) return;
    setActivePermissions([...allPermissionKeys]);
  };

  const handleRevokeAll = () => {
    if (isOwnerRole) return;
    setActivePermissions([]);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      const res = await api.put(`/roles/${selectedRoleId}`, {
        description: roleDescription,
        canViewProfit,
        permissions: isOwnerRole ? ['*'] : activePermissions,
      });

      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRoleId
            ? {
                ...r,
                description: roleDescription,
                canViewProfit,
                permissions: res.data.permissions || activePermissions,
              }
            : r
        )
      );

      await refreshUser();
      setToastMessage(`Hak akses untuk role '${selectedRole?.name}' berhasil disimpan!`);
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Gagal menyimpan hak akses role.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      setCreatingRole(true);
      const res = await api.post('/roles', {
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        canViewProfit: false,
        permissions: ['dashboard:view'],
      });

      setRoles((prev) => [...prev, { ...res.data, userCount: 0 }]);
      setShowNewRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedRoleId(res.data.id);
      setActivePermissions(res.data.permissions || ['dashboard:view']);
      setRoleDescription(res.data.description || '');
      setCanViewProfit(false);
      setToastMessage(`Role baru '${res.data.name}' berhasil dibuat.`);
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Gagal membuat role.');
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await api.delete(`/roles/${roleToDelete.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      setToastMessage(`Role '${roleToDelete.name}' berhasil dihapus.`);
      if (selectedRoleId === roleToDelete.id) {
        const remaining = roles.filter((r) => r.id !== roleToDelete.id);
        if (remaining.length > 0) {
          handleSelectRole(remaining[0]);
        }
      }
      setRoleToDelete(null);
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Gagal menghapus role.');
    }
  };

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase();
    return catalog
      .map((mod) => {
        const modMatches =
          mod.label.toLowerCase().includes(q) || mod.key.toLowerCase().includes(q);
        const matchingActions = mod.actions.filter(
          (act) => act.label.toLowerCase().includes(q) || act.key.toLowerCase().includes(q)
        );
        if (modMatches) return mod;
        if (matchingActions.length > 0) return { ...mod, actions: matchingActions };
        return null;
      })
      .filter(Boolean) as ModuleDef[];
  }, [catalog, searchQuery]);

  const groupedModules = useMemo(() => {
    const groups: Record<string, ModuleDef[]> = {
      Main: [],
      'Master Data': [],
      Operations: [],
      Finance: [],
      System: [],
    };

    filteredCatalog.forEach((mod) => {
      if (groups[mod.group]) {
        groups[mod.group].push(mod);
      }
    });

    return groups;
  }, [filteredCatalog]);

  const grantedCount = useMemo(() => {
    if (isOwnerRole) return allPermissionKeys.length;
    if (activePermissions.includes('*')) return allPermissionKeys.length;
    return activePermissions.filter((k) => allPermissionKeys.includes(k)).length;
  }, [isOwnerRole, activePermissions, allPermissionKeys]);

  return {
    roles,
    selectedRole,
    selectedRoleId,
    isOwnerRole,
    loading,
    saving,
    toastMessage,
    setToastMessage,
    roleDescription,
    setRoleDescription,
    canViewProfit,
    setCanViewProfit,
    searchQuery,
    setSearchQuery,
    allPermissionKeys,
    grantedCount,
    groupedModules,
    showNewRoleModal,
    setShowNewRoleModal,
    newRoleName,
    setNewRoleName,
    newRoleDesc,
    setNewRoleDesc,
    creatingRole,
    roleToDelete,
    setRoleToDelete,
    handleSelectRole,
    isPermissionChecked,
    togglePermission,
    toggleModulePermissions,
    toggleGroupPermissions,
    handleGrantAll,
    handleRevokeAll,
    handleSave,
    handleCreateRole,
    handleDeleteRole,
  };
}
