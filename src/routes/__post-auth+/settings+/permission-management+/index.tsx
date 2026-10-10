import React from 'react';
import { ShieldCheck, Plus, Loader2 } from 'lucide-react';
import { Toast } from '~/components/Toast';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { usePermissionManagement } from './hooks/use-permission-management';
import { PermissionRoleSelector } from './components/permission-role-selector';
import { PermissionRoleHeader } from './components/permission-role-header';
import { PermissionMatrix } from './components/permission-matrix';
import { PermissionNewRoleModal } from './components/permission-new-role-modal';

export default function PermissionManagementRoute() {
  const {
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
  } = usePermissionManagement();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-cherry-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div
        className={
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 ' +
          'border-b border-brand-200/60 pb-5'
        }
      >
        <div className="flex items-center gap-2.5">
          <div
            className={
              'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ' +
              'from-cherry-500 to-rose-600 text-white shadow-md shadow-cherry-500/20'
            }
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-900 tracking-tight">
              Role & Permission Management
            </h1>
            <p className="text-xs text-brand-500 font-medium">
              Sistem Hak Akses Dinamis: Atur akses menu halaman & izin detail tombol.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewRoleModal(true)}
          className={
            'btn-primary flex items-center justify-center gap-2 text-xs ' +
            'font-bold shrink-0 cursor-pointer'
          }
        >
          <Plus size={16} />
          Tambah Custom Role
        </button>
      </div>

      {/* Role Selector Tabs */}
      <PermissionRoleSelector
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={handleSelectRole}
      />

      {/* Role Details & Permissions Checklist Container */}
      {selectedRole && (
        <div className="rounded-3xl border border-brand-200/80 bg-white shadow-xs overflow-hidden">
          <PermissionRoleHeader
            selectedRole={selectedRole}
            isOwnerRole={isOwnerRole}
            roleDescription={roleDescription}
            setRoleDescription={setRoleDescription}
            canViewProfit={canViewProfit}
            setCanViewProfit={setCanViewProfit}
            saving={saving}
            onSave={handleSave}
            onDelete={() => setRoleToDelete(selectedRole)}
            grantedCount={grantedCount}
            totalPermissions={allPermissionKeys.length}
            onGrantAll={handleGrantAll}
            onRevokeAll={handleRevokeAll}
          />

          <PermissionMatrix
            groupedModules={groupedModules}
            isOwnerRole={isOwnerRole}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isPermissionChecked={isPermissionChecked}
            togglePermission={togglePermission}
            toggleModulePermissions={toggleModulePermissions}
            toggleGroupPermissions={toggleGroupPermissions}
          />
        </div>
      )}

      {/* New Role Modal */}
      <PermissionNewRoleModal
        isOpen={showNewRoleModal}
        onClose={() => setShowNewRoleModal(false)}
        onSubmit={handleCreateRole}
        newRoleName={newRoleName}
        setNewRoleName={setNewRoleName}
        newRoleDesc={newRoleDesc}
        setNewRoleDesc={setNewRoleDesc}
        creatingRole={creatingRole}
      />

      {/* Delete Role Confirm Dialog */}
      {roleToDelete && (
        <ConfirmDialog
          open={Boolean(roleToDelete)}
          title={`Hapus Role '${roleToDelete.name}'?`}
          message={
            `Apakah Anda yakin ingin menghapus role '${roleToDelete.name}'? ` +
            'Tindakan ini tidak dapat dibatalkan.'
          }
          onConfirm={handleDeleteRole}
          onCancel={() => setRoleToDelete(null)}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
