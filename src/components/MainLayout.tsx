import React, { useState } from 'react';
import { Barang, TransaksiBarangMasuk, TransaksiBarangKeluar, UserSession } from '../types';
import { MasterBarangView } from './MasterBarangView';
import { BarangMasukView } from './BarangMasukView';
import { BarangKeluarView } from './BarangKeluarView';
import { LaporanStokView } from './LaporanStokView';
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  LogOut,
  ShieldCheck,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { RealtimeStatus } from '../services/realtime';

interface MainLayoutProps {
  session: UserSession;
  barangList: Barang[];
  transaksiMasuk: TransaksiBarangMasuk[];
  transaksiKeluar: TransaksiBarangKeluar[];
  realtimeStatus?: RealtimeStatus;
  isSyncing?: boolean;
  onForceSync?: () => void;
  onDataChanged: () => void;
  onLogout: () => void;
}

export type MainTab = 'master_barang' | 'barang_masuk' | 'barang_keluar' | 'laporan';

export const MainLayout: React.FC<MainLayoutProps> = ({
  session,
  barangList,
  transaksiMasuk,
  transaksiKeluar,
  realtimeStatus = 'connected',
  isSyncing = false,
  onForceSync,
  onDataChanged,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('master_barang');

  const isAdmin = session.role === 'admin';

  return (
    <div className="app-container">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-brand">
          <img
            src="/images/gambar.png"
            alt="Logo Gudang"
            className="header-logo"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="header-brand-text">
            <h1 className="header-title">Sistem Gudang & Inventaris</h1>
            <div className="header-subtitle">WMS • Manajemen Logistik & Stok Terpadu</div>
          </div>
        </div>

        <div className="header-user-info">
          {/* Real-time Cloud SQL Sync Badge & Button */}
          <div className="header-sync-badge">
            <span
              className="sync-status-indicator"
              style={{
                color: realtimeStatus === 'connected' ? '#86efac' : realtimeStatus === 'connecting' ? '#fde047' : '#fca5a5'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: realtimeStatus === 'connected' ? '#22c55e' : realtimeStatus === 'connecting' ? '#eab308' : '#ef4444',
                  boxShadow: realtimeStatus === 'connected' ? '0 0 8px #22c55e' : 'none'
                }}
              />
              <span className="sync-status-text">
                {realtimeStatus === 'connected' ? 'Real-Time' : realtimeStatus === 'connecting' ? 'Koneksi...' : 'Offline'}
              </span>
            </span>

            {onForceSync && (
              <button
                type="button"
                onClick={onForceSync}
                disabled={isSyncing}
                title="Sinkronkan data sekarang dari Cloud SQL"
                className="btn-sync-action"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span className="btn-sync-label">{isSyncing ? 'Sync...' : 'Sync'}</span>
              </button>
            )}
          </div>

          <div className="header-user-text">
            <div className="header-user-name">
              {session.nama || session.email}
            </div>
            <div className="header-user-email">
              {session.email}
            </div>
          </div>

          <span className={`user-badge-role ${isAdmin ? 'role-admin' : 'role-petugas'}`}>
            {isAdmin ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> <span className="role-label">Admin</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={12} /> <span className="role-label">Petugas</span>
              </span>
            )}
          </span>

          <button
            type="button"
            className="btn btn-outline btn-logout"
            onClick={onLogout}
            title="Keluar dari sesi akun"
          >
            <LogOut size={14} />
            <span className="btn-logout-text">Keluar</span>
          </button>
        </div>
      </header>

      {/* ================= NAVIGATION TABS (TABLET & DESKTOP) ================= */}
      <nav className="nav-tabs-bar desktop-nav no-print">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'master_barang' ? 'active' : ''}`}
          onClick={() => setActiveTab('master_barang')}
        >
          <Package size={17} color="#2563eb" />
          <span>1. Data Master Barang</span>
          <span className="nav-tab-badge">
            {barangList.length}
          </span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'barang_masuk' ? 'active' : ''}`}
          onClick={() => setActiveTab('barang_masuk')}
        >
          <ArrowDownToLine size={17} color="#059669" />
          <span>2. Transaksi Barang Masuk</span>
          <span className="nav-tab-badge" style={{
            background: activeTab === 'barang_masuk' ? '#059669' : '#e2e8f0',
            color: activeTab === 'barang_masuk' ? '#ffffff' : '#475569'
          }}>
            {transaksiMasuk.length}
          </span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'barang_keluar' ? 'active' : ''}`}
          onClick={() => setActiveTab('barang_keluar')}
        >
          <ArrowUpFromLine size={17} color="#dc2626" />
          <span>3. Transaksi Barang Keluar</span>
          <span className="nav-tab-badge" style={{
            background: activeTab === 'barang_keluar' ? '#dc2626' : '#e2e8f0',
            color: activeTab === 'barang_keluar' ? '#ffffff' : '#475569'
          }}>
            {transaksiKeluar.length}
          </span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'laporan' ? 'active' : ''}`}
          onClick={() => setActiveTab('laporan')}
        >
          <FileText size={17} color="#6d28d9" />
          <span>4. Cetak Laporan Stok & Mutasi</span>
        </button>
      </nav>

      {/* ================= MOBILE BOTTOM NAVIGATION (SMARTPHONES) ================= */}
      <nav className="mobile-bottom-nav no-print" aria-label="Navigasi Bawah Mobile">
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'master_barang' ? 'active' : ''}`}
          onClick={() => setActiveTab('master_barang')}
        >
          <div className="mobile-nav-icon-wrapper">
            <Package size={20} />
            <span className="mobile-nav-badge">{barangList.length}</span>
          </div>
          <span className="mobile-nav-label">Master</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'barang_masuk' ? 'active' : ''}`}
          onClick={() => setActiveTab('barang_masuk')}
        >
          <div className="mobile-nav-icon-wrapper">
            <ArrowDownToLine size={20} />
            <span className="mobile-nav-badge" style={{ background: '#059669' }}>{transaksiMasuk.length}</span>
          </div>
          <span className="mobile-nav-label">Masuk</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'barang_keluar' ? 'active' : ''}`}
          onClick={() => setActiveTab('barang_keluar')}
        >
          <div className="mobile-nav-icon-wrapper">
            <ArrowUpFromLine size={20} />
            <span className="mobile-nav-badge" style={{ background: '#dc2626' }}>{transaksiKeluar.length}</span>
          </div>
          <span className="mobile-nav-label">Keluar</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'laporan' ? 'active' : ''}`}
          onClick={() => setActiveTab('laporan')}
        >
          <div className="mobile-nav-icon-wrapper">
            <FileText size={20} />
          </div>
          <span className="mobile-nav-label">Laporan</span>
        </button>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {activeTab === 'master_barang' && (
          <MasterBarangView
            session={session}
            barangList={barangList}
            onDataChanged={onDataChanged}
          />
        )}

        {activeTab === 'barang_masuk' && (
          <BarangMasukView
            session={session}
            barangList={barangList}
            transaksiList={transaksiMasuk}
            onDataChanged={onDataChanged}
          />
        )}

        {activeTab === 'barang_keluar' && (
          <BarangKeluarView
            session={session}
            barangList={barangList}
            transaksiList={transaksiKeluar}
            onDataChanged={onDataChanged}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanStokView
            session={session}
            barangList={barangList}
            transaksiMasuk={transaksiMasuk}
            transaksiKeluar={transaksiKeluar}
          />
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer no-print">
        <p>© 2026 Powered by Dimas Frandika • Sistem Manajemen Pergudangan & Logistik</p>
      </footer>
    </div>
  );
};
