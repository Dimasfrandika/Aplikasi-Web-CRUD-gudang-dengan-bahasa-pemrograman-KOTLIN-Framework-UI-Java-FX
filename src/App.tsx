import { useState, useEffect } from 'react';
import {
  Barang,
  TransaksiBarangMasuk,
  TransaksiBarangKeluar,
  UserSession
} from './types';
import {
  SessionService,
  BarangRepository,
  TransaksiMasukRepository,
  TransaksiKeluarRepository,
  syncAllFromBackend
} from './services/storage';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { MainLayout } from './components/MainLayout';

export type ActiveScene = 'login' | 'register' | 'main';

export function App() {
  const [currentScene, setCurrentScene] = useState<ActiveScene>('login');
  const [session, setSession] = useState<UserSession>({
    userId: null,
    nama: null,
    email: null,
    role: null
  });

  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [transaksiMasuk, setTransaksiMasuk] = useState<TransaksiBarangMasuk[]>([]);
  const [transaksiKeluar, setTransaksiKeluar] = useState<TransaksiBarangKeluar[]>([]);

  const reloadData = async () => {
    // 1. Immediately read from cache for snappy UI
    const barangRepo = new BarangRepository();
    const masukRepo = new TransaksiMasukRepository();
    const keluarRepo = new TransaksiKeluarRepository();

    setBarangList(barangRepo.getAll(true));
    setTransaksiMasuk(masukRepo.getAll());
    setTransaksiKeluar(keluarRepo.getAll());

    // 2. Fetch fresh data from Cloud SQL backend
    try {
      await syncAllFromBackend();
      setBarangList(barangRepo.getAll(true));
      setTransaksiMasuk(masukRepo.getAll());
      setTransaksiKeluar(keluarRepo.getAll());
    } catch (e) {
      console.warn('Sync failed, using offline cache', e);
    }
  };

  useEffect(() => {
    // Pre-sync on app boot
    syncAllFromBackend().catch(() => {});
    const currentSession = SessionService.getSession();
    if (currentSession.userId) {
      setSession(currentSession);
      setCurrentScene('main');
      reloadData();
    } else {
      setCurrentScene('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    const freshSession = SessionService.getSession();
    setSession(freshSession);
    setCurrentScene('main');
    reloadData();
  };

  const handleLogout = () => {
    SessionService.clear();
    setSession({ userId: null, nama: null, email: null, role: null });
    setCurrentScene('login');
  };

  return (
    <>
      {currentScene === 'login' && (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScene('register')}
        />
      )}

      {currentScene === 'register' && (
        <RegisterView
          onRegisterSuccess={() => setCurrentScene('login')}
          onNavigateToLogin={() => setCurrentScene('login')}
        />
      )}

      {currentScene === 'main' && session.userId && (
        <MainLayout
          session={session}
          barangList={barangList}
          transaksiMasuk={transaksiMasuk}
          transaksiKeluar={transaksiKeluar}
          onDataChanged={reloadData}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
