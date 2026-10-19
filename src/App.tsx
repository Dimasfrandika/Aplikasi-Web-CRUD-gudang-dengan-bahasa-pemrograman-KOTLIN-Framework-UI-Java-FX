import { useState, useEffect, useCallback } from 'react';
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
import { realtimeService, RealtimeStatus } from './services/realtime';
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
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const reloadData = useCallback(async () => {
    try {
      // 1. Fetch fresh data directly from PostgreSQL backend API
      const fresh = await syncAllFromBackend();
      if (fresh.barang && (fresh.barang.length > 0 || fresh.masuk.length > 0 || fresh.keluar.length > 0)) {
        setBarangList(fresh.barang);
        setTransaksiMasuk(fresh.masuk);
        setTransaksiKeluar(fresh.keluar);
        return;
      }
    } catch (e) {
      console.warn('Sync failed, using offline cache:', e);
    }

    // 2. Fallback to local storage if API is unreachable
    const barangRepo = new BarangRepository();
    const masukRepo = new TransaksiMasukRepository();
    const keluarRepo = new TransaksiKeluarRepository();
    setBarangList(barangRepo.getAll(true));
    setTransaksiMasuk(masukRepo.getAll());
    setTransaksiKeluar(keluarRepo.getAll());
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    await reloadData();
    setTimeout(() => {
      setIsSyncing(false);
    }, 400);
  };

  useEffect(() => {
    // 1. Initial check & sync
    const currentSession = SessionService.getSession();
    if (currentSession.userId) {
      setSession(currentSession);
      setCurrentScene('main');
      reloadData();
    } else {
      setCurrentScene('login');
      syncAllFromBackend().catch(() => {});
    }

    // 2. Real-time WebSocket connection status listener
    const unsubStatus = realtimeService.onStatusChange((status) => {
      setRealtimeStatus(status);
    });

    // 3. Real-time data change event listener from other devices/browsers
    const unsubEvent = realtimeService.subscribe((_event) => {
      reloadData();
    });

    return () => {
      unsubStatus();
      unsubEvent();
    };
  }, [reloadData]);

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
          realtimeStatus={realtimeStatus}
          isSyncing={isSyncing}
          onForceSync={handleForceSync}
          onDataChanged={reloadData}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
