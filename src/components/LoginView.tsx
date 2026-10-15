import React, { useState } from 'react';
import { AuthService } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';

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

  const handleLogin = (e?: React.FormEvent) => {
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

    const result = authService.login(trimmedEmail, trimmedPassword);

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

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
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
        <p className="auth-subtitle">Silakan login sesuai peran akses Anda (Admin / Petugas Gudang)</p>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Username / Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="admin@gudang.com / dimasfrandika87@gmail.com"
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

        {/* Quick Demo Switcher per Actor Requirement */}
        <div style={{
          marginTop: '10px',
          padding: '14px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          width: '100%'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
            Pilih Akun Demo Cepat (Role-Based Access):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@gudang.com', 'admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                background: '#fff5f5',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#dc2626" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>Admin (Akses Penuh)</div>
                  <div style={{ fontSize: '11px', color: '#7f1d1d' }}>admin@gudang.com</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>
                Gunakan
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('dimasfrandika87@gmail.com', 'password123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Petugas Gudang (Operasional)</div>
                  <div style={{ fontSize: '11px', color: '#1e3a8a' }}>dimasfrandika87@gmail.com</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>
                Gunakan
              </span>
            </button>
          </div>
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
