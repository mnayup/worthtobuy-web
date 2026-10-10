import React from 'react';
import { Toast } from '~/components/Toast';
import { useProfile } from './hooks/use-profile';
import { ProfileHeaderBanner } from './components/profile-header-banner';
import { ProfileInfoCard } from './components/profile-info-card';
import { ProfilePasswordCard } from './components/profile-password-card';
import { ProfileMfaSection } from './components/profile-mfa-section';
import { ProfileMfaModal } from './components/profile-mfa-modal';
import { ProfileDisableMfaModal } from './components/profile-disable-mfa-modal';

export default function ProfileRoute() {
  const {
    user,
    name,
    setName,
    username,
    setUsername,
    email,
    setEmail,
    phone,
    setPhone,
    savingProfile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPass,
    setShowCurrentPass,
    showNewPass,
    setShowNewPass,
    savingPassword,
    showMfaModal,
    setShowMfaModal,
    mfaSetupData,
    mfaCode,
    setMfaCode,
    mfaRecoveryCodes,
    setMfaRecoveryCodes,
    enablingMfa,
    copiedSecret,
    copiedRecovery,
    showDisableMfaModal,
    setShowDisableMfaModal,
    disableVerifyInput,
    setDisableVerifyInput,
    disablingMfa,
    toastMessage,
    setToastMessage,
    handleSaveProfile,
    handleChangePassword,
    handleStartMfaSetup,
    handleConfirmEnableMfa,
    handleDisableMfa,
    copySecretToClipboard,
    copyRecoveryCodes,
    downloadRecoveryCodes,
  } = useProfile();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <ProfileHeaderBanner
        name={name}
        username={username || user?.username || ''}
        role={user?.role}
        mfaEnabled={user?.mfaEnabled}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Profile Info */}
        <ProfileInfoCard
          name={name}
          setName={setName}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          savingProfile={savingProfile}
          onSubmit={handleSaveProfile}
        />

        {/* Change Password Card */}
        <ProfilePasswordCard
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showCurrentPass={showCurrentPass}
          setShowCurrentPass={setShowCurrentPass}
          showNewPass={showNewPass}
          setShowNewPass={setShowNewPass}
          savingPassword={savingPassword}
          onSubmit={handleChangePassword}
        />
      </div>

      {/* Two-Factor Authentication (MFA) Section */}
      <ProfileMfaSection
        mfaEnabled={user?.mfaEnabled}
        onStartSetup={handleStartMfaSetup}
        onOpenDisable={() => {
          setDisableVerifyInput('');
          setShowDisableMfaModal(true);
        }}
      />

      {/* Setup MFA Modal */}
      <ProfileMfaModal
        isOpen={showMfaModal}
        onClose={() => {
          setShowMfaModal(false);
          setMfaRecoveryCodes([]);
        }}
        mfaRecoveryCodes={mfaRecoveryCodes}
        mfaSetupData={mfaSetupData}
        mfaCode={mfaCode}
        setMfaCode={setMfaCode}
        enablingMfa={enablingMfa}
        copiedSecret={copiedSecret}
        copiedRecovery={copiedRecovery}
        onCopySecret={copySecretToClipboard}
        onCopyRecovery={copyRecoveryCodes}
        onDownloadRecovery={downloadRecoveryCodes}
        onSubmitOtp={handleConfirmEnableMfa}
      />

      {/* Disable MFA Modal */}
      <ProfileDisableMfaModal
        isOpen={showDisableMfaModal}
        onClose={() => setShowDisableMfaModal(false)}
        disableVerifyInput={disableVerifyInput}
        setDisableVerifyInput={setDisableVerifyInput}
        disablingMfa={disablingMfa}
        onSubmit={handleDisableMfa}
      />

      {/* General Notification Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
