import { useState, useEffect, type FormEvent } from 'react';
import { api, errorMessage } from '~/lib/api';
import { useAuth } from '~/context/AuthContext';

export function useProfile() {
  const { user, updateUser, refreshUser } = useAuth();

  // Profile Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // MFA Setup Modal state
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([]);
  const [enablingMfa, setEnablingMfa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  // Disable MFA Dialog
  const [showDisableMfaModal, setShowDisableMfaModal] = useState(false);
  const [disableVerifyInput, setDisableVerifyInput] = useState('');
  const [disablingMfa, setDisablingMfa] = useState(false);

  // General Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/users/profile');
        if (res.data) {
          setName(res.data.name || '');
          setUsername(res.data.username || '');
          setEmail(res.data.email || '');
          setPhone(res.data.phone || '');
          updateUser(res.data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !phone.trim()) {
      setToastMessage('Nama, Username, dan No WhatsApp wajib diisi.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/users/profile', {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim() ? email.trim().toLowerCase() : null,
        phone: phone.trim() || null,
      });

      updateUser(res.data);
      setToastMessage('Profil berhasil diperbarui!');
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setToastMessage('Password saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setToastMessage('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.put('/users/profile/password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Password berhasil diubah!');
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Gagal mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStartMfaSetup = async () => {
    try {
      setMfaSetupData(null);
      setMfaRecoveryCodes([]);
      setMfaCode('');
      setShowMfaModal(true);

      const res = await api.get('/users/profile/mfa/setup');
      setMfaSetupData(res.data);
    } catch (err) {
      setShowMfaModal(false);
      setToastMessage(errorMessage(err) || 'Gagal memulai setup MFA.');
    }
  };

  const handleConfirmEnableMfa = async (e: FormEvent) => {
    e.preventDefault();
    if (!mfaSetupData?.secret || !mfaCode.trim()) return;

    try {
      setEnablingMfa(true);
      const res = await api.post('/users/profile/mfa/enable', {
        secret: mfaSetupData.secret,
        code: mfaCode.trim(),
      });

      setMfaRecoveryCodes(res.data.recoveryCodes || []);
      updateUser({ mfaEnabled: true });
      await refreshUser();
      setToastMessage('MFA 2-Factor Authentication berhasil diaktifkan!');
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Kode OTP tidak valid.');
    } finally {
      setEnablingMfa(false);
    }
  };

  const handleDisableMfa = async (e: FormEvent) => {
    e.preventDefault();
    if (!disableVerifyInput.trim()) return;

    try {
      setDisablingMfa(true);
      await api.post('/users/profile/mfa/disable', {
        passwordOrCode: disableVerifyInput.trim(),
      });

      updateUser({ mfaEnabled: false });
      await refreshUser();
      setShowDisableMfaModal(false);
      setDisableVerifyInput('');
      setToastMessage('MFA berhasil dinonaktifkan.');
    } catch (err) {
      setToastMessage(errorMessage(err) || 'Password atau kode OTP salah.');
    } finally {
      setDisablingMfa(false);
    }
  };

  const copySecretToClipboard = () => {
    if (!mfaSetupData?.secret) return;
    navigator.clipboard.writeText(mfaSetupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyRecoveryCodes = () => {
    if (mfaRecoveryCodes.length === 0) return;
    navigator.clipboard.writeText(mfaRecoveryCodes.join('\n'));
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const text =
      `WORTHTOBUY 2FA RECOVERY CODES\nAccount: @${username || user?.username}\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      mfaRecoveryCodes.map((code, idx) => `${idx + 1}. ${code}`).join('\n') +
      '\n\nSimpan kode ini di tempat yang aman. Setiap kode hanya dapat digunakan satu kali.';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worthtobuy-recovery-codes-${username || 'user'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
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
  };
}
