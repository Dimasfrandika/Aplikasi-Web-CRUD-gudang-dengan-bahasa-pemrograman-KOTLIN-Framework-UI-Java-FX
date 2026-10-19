import React, { useState } from 'react';
import { AuthService } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert Dialog State
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const authService = new AuthService();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Gagal',
        message: 'Username / Email dan password wajib diisi!'
      });
      setIsSubmitting(false);
      return;
    }

    const result = await authService.login(trimmedEmail, trimmedPassword);

    if (result.success && result.user) {
      onLoginSuccess();
    } else {
      setAlertState({
        isOpen: true,
        title: 'Autentikasi Gagal',
        message: result.message || 'Username/Email atau password salah. Pastikan kredensial terdaftar di sistem.'
      });
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
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

        <h1 className="auth-title">Sistem Gudang & Inventaris</h1>
        <p className="auth-subtitle">Silakan masukkan email dan password untuk masuk ke sistem</p>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Username / Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Masukkan email terdaftar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={handleTogglePassword}
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
          >
            {isSubmitting ? 'MEMVALIDASI...' : 'MASUK KE SISTEM'}
          </button>
        </form>

        <div className="auth-footer">
          <span className="auth-footer-text">Belum punya akun?</span>
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToRegister}
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
};
