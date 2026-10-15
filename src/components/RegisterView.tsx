import React, { useState } from 'react';
import { AuthService } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { Eye, EyeOff, Shield, User } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterViewProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('petugas');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert Dialog State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onDismiss?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const authService = new AuthService();

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    const trimmedNama = nama.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setAlertState({
        isOpen: true,
        title: 'Error',
        message: 'Email dan password wajib diisi!'
      });
      setIsSubmitting(false);
      return;
    }

    const result = authService.register(trimmedNama, trimmedEmail, trimmedPassword, role);

    if (result.success) {
      setAlertState({
        isOpen: true,
        title: 'Registrasi Berhasil',
        message: `Akun atas nama ${trimmedNama || trimmedEmail} dengan peran ${role === 'admin' ? 'Admin' : 'Petugas Gudang'} berhasil dibuat. Silakan login.`,
        onDismiss: () => {
          onRegisterSuccess();
        }
      });
    } else {
      setAlertState({
        isOpen: true,
        title: 'Gagal Mendaftar',
        message: result.message || 'Email sudah terdaftar di sistem.'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <img
          src="/images/gambar.png"
          alt="Gudang Logo"
          className="auth-logo"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <h1 className="auth-title">Pendaftaran Akun</h1>
        <p className="auth-subtitle">Daftarkan akun pengguna sistem gudang baru</p>

        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Nama Lengkap</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Contoh: Dimas Frandika"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Peran Pengguna (Role)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('petugas')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'petugas' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: role === 'petugas' ? '#eff6ff' : '#ffffff',
                  color: role === 'petugas' ? '#1e40af' : '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <User size={16} />
                Petugas Gudang
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'admin' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  background: role === 'admin' ? '#fff5f5' : '#ffffff',
                  color: role === 'admin' ? '#991b1b' : '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Shield size={16} />
                Admin
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            {isSubmitting ? 'MENDAFTAR...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '6px' }}>
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToLogin}
          >
            Sudah punya akun? Kembali ke Login
          </button>
        </div>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => {
          setAlertState(prev => ({ ...prev, isOpen: false }));
          if (alertState.onDismiss) {
            alertState.onDismiss();
          }
        }}
      />
    </div>
  );
};
