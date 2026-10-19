import React, { useState } from 'react';
import { AuthService } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { Eye, EyeOff, User } from 'lucide-react';

interface RegisterViewProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRegister = async (e?: React.FormEvent) => {
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

    const result = await authService.register(trimmedNama, trimmedEmail, trimmedPassword, 'petugas');

    if (result.success) {
      setAlertState({
        isOpen: true,
        title: 'Registrasi Berhasil',
        message: `Akun Petugas Gudang atas nama ${trimmedNama || trimmedEmail} berhasil dibuat. Silakan login.`,
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
            <label className="input-label">Peran Akun Baru</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1e40af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>Petugas Gudang (Operasional)</div>
                  <div style={{ fontSize: '11px', color: '#3b82f6' }}>Mencatat transaksi masuk & keluar, cetak surat barang</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                Standar
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              *Catatan: Hak akses Administrator bersifat privat dan tidak dibuka untuk pendaftaran umum.
            </p>
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
