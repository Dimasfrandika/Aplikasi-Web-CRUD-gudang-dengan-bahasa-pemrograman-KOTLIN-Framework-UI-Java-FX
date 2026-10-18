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
          <div>
            <h1 className="header-title">Sistem Manajemen Data Gudang</h1>
            <div className="header-subtitle">Warehouse Management System • Logistik & Stok Terpadu</div>
          </div>
        </div>

        <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Real-time Cloud SQL Sync Badge & Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: realtimeStatus === 'connected' ? '#86efac' : realtimeStatus === 'connecting' ? '#fde047' : '#fca5a5'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: realtimeStatus === 'connected' ? '#22c55e' : realtimeStatus === 'connecting' ? '#eab308' : '#ef4444',
                boxShadow: realtimeStatus === 'connected' ? '0 0 8px #22c55e' : 'none'
              }} />
              {realtimeStatus === 'connected' ? 'Real-Time Aktif' : realtimeStatus === 'connecting' ? 'Menghubungkan...' : 'Offline'}
            </span>

            {onForceSync && (
              <button
                type="button"
                onClick={onForceSync}
                disabled={isSyncing}
                title="Sinkronkan data sekarang dari Cloud SQL"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Sinkron...' : 'Sinkron'}
              </button>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              {session.nama || session.email}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
              {session.email}
            </div>
          </div>

          <span className={`user-badge-role ${isAdmin ? 'role-admin' : 'role-petugas'}`}>
            {isAdmin ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Admin Gudang
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={12} /> Petugas Gudang
              </span>
            )}
          </span>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onLogout}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#ffffff',
              backgroundColor: 'rgba(239, 68, 68, 0.25)'
            }}
            title="Keluar dari sesi akun"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </header>

      {/* ================= NAVIGATION TABS ================= */}
      <nav className="nav-tabs-bar no-print">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'master_barang' ? 'active' : ''}`}
          onClick={() => setActiveTab('master_barang')}
        >
          <Package size={17} color="#2563eb" />
          1. Data Master Barang
          <span style={{
            background: activeTab === 'master_barang' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'master_barang' ? '#ffffff' : '#475569',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '999px',
            fontWeight: 700
          }}>
            {barangList.length}
          </span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'barang_masuk' ? 'active' : ''}`}
          onClick={() => setActiveTab('barang_masuk')}
        >
          <ArrowDownToLine size={17} color="#059669" />
          2. Transaksi Barang Masuk
          <span style={{
            background: activeTab === 'barang_masuk' ? '#059669' : '#e2e8f0',
            color: activeTab === 'barang_masuk' ? '#ffffff' : '#475569',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '999px',
            fontWeight: 700
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
          3. Transaksi Barang Keluar
          <span style={{
            background: activeTab === 'barang_keluar' ? '#dc2626' : '#e2e8f0',
            color: activeTab === 'barang_keluar' ? '#ffffff' : '#475569',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '999px',
            fontWeight: 700
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
          4. Cetak Laporan Stok & Mutasi
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
