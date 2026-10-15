import React, { useState } from 'react';
import { Barang, UserSession } from '../types';
import { BarangRepository } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Package,
  AlertTriangle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Layers,
  Filter,
  ShieldCheck,
  Info
} from 'lucide-react';

interface MasterBarangViewProps {
  session: UserSession;
  barangList: Barang[];
  onDataChanged: () => void;
}

export const MasterBarangView: React.FC<MasterBarangViewProps> = ({
  session,
  barangList,
  onDataChanged
}) => {
  const isAdmin = session.role === 'admin';
  const repository = new BarangRepository();

  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Form Fields (Admin only)
  const [idBarang, setIdBarang] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [kategori, setKategori] = useState('Elektronik');
  const [stok, setStok] = useState('0');
  const [minStok, setMinStok] = useState('5');
  const [satuan, setSatuan] = useState('Unit');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [keterangan, setKeterangan] = useState('');

  // Alert State
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleSelectBarang = (item: Barang) => {
    setSelectedBarang(item);
    if (isAdmin) {
      setIdBarang(item.idBarang);
      setNamaBarang(item.namaBarang);
      setKategori(item.kategori || 'Umum');
      setStok(item.stok.toString());
      setMinStok(item.minStok?.toString() || '0');
      setSatuan(item.satuan);
      setStatus(item.status || 'aktif');
      setKeterangan(item.keterangan || '');
    }
  };

  const clearForm = () => {
    setSelectedBarang(null);
    setIdBarang('');
    setNamaBarang('');
    setKategori('Elektronik');
    setStok('0');
    setMinStok('5');
    setSatuan('Unit');
    setStatus('aktif');
    setKeterangan('');
  };

  const handleTambah = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isAdmin) {
      setAlertState({
        isOpen: true,
        title: 'Akses Dibatasi',
        message: 'Hak akses terbatas! Hanya Administrator yang berwenang menambahkan master barang baru.'
      });
      return;
    }

    if (!idBarang.trim() || !namaBarang.trim() || !satuan.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Form',
        message: 'Mohon lengkapi kolom Kode Barang, Nama Barang, dan Satuan!'
      });
      return;
    }

    const parsedStok = parseInt(stok, 10);
    const parsedMinStok = parseInt(minStok, 10);

    if (isNaN(parsedStok) || parsedStok < 0 || isNaN(parsedMinStok) || parsedMinStok < 0) {
      setAlertState({
        isOpen: true,
        title: 'Input Tidak Valid',
        message: 'Stok dan Limit Stok Minimum harus berupa angka valid (minimal 0)!'
      });
      return;
    }

    const result = repository.insert({
      idBarang: idBarang.trim(),
      namaBarang: namaBarang.trim(),
      kategori: kategori.trim(),
      stok: parsedStok,
      minStok: parsedMinStok,
      satuan: satuan.trim(),
      status: status,
      keterangan: keterangan.trim()
    });

    if (result.success) {
      onDataChanged();
      clearForm();
      setAlertState({
        isOpen: true,
        title: 'Berhasil',
        message: `Barang '${namaBarang}' berhasil ditambahkan ke katalog master gudang.`
      });
    } else {
      setAlertState({
        isOpen: true,
        title: 'Gagal Menambah',
        message: result.message || 'Terjadi kesalahan saat menyimpan barang.'
      });
    }
  };

  const handleUbah = () => {
    if (!isAdmin) {
      return;
    }

    if (!selectedBarang) {
      setAlertState({
        isOpen: true,
        title: 'Peringatan',
        message: 'Silakan pilih data barang dari tabel terlebih dahulu untuk diubah!'
      });
      return;
    }

    if (!idBarang.trim() || !namaBarang.trim() || !satuan.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Form',
        message: 'Mohon lengkapi kolom Kode Barang, Nama Barang, dan Satuan!'
      });
      return;
    }

    const parsedStok = parseInt(stok, 10);
    const parsedMinStok = parseInt(minStok, 10);

    if (isNaN(parsedStok) || parsedStok < 0 || isNaN(parsedMinStok) || parsedMinStok < 0) {
      setAlertState({
        isOpen: true,
        title: 'Input Tidak Valid',
        message: 'Stok dan Limit Stok Minimum harus berupa angka valid!'
      });
      return;
    }

    const result = repository.update({
      id: selectedBarang.id,
      idBarang: idBarang.trim(),
      namaBarang: namaBarang.trim(),
      kategori: kategori.trim(),
      stok: parsedStok,
      minStok: parsedMinStok,
      satuan: satuan.trim(),
      status: status,
      keterangan: keterangan.trim()
    });

    if (result.success) {
      onDataChanged();
      setAlertState({
        isOpen: true,
        title: 'Berhasil Diperbarui',
        message: `Data barang '${namaBarang}' berhasil disimpan ke database.`
      });
    } else {
      setAlertState({
        isOpen: true,
        title: 'Gagal Memperbarui',
        message: result.message || 'Terjadi kesalahan saat memperbarui barang.'
      });
    }
  };

  const handleToggleStatus = () => {
    if (!isAdmin || !selectedBarang) return;

    const res = repository.toggleStatus(selectedBarang.id);
    if (res.success && res.newStatus) {
      setStatus(res.newStatus);
      onDataChanged();
      setAlertState({
        isOpen: true,
        title: 'Status Diperbarui',
        message: `Status barang '${selectedBarang.namaBarang}' kini menjadi ${res.newStatus.toUpperCase()}. Riwayat transaksi tetap aman tersimpan.`
      });
    }
  };

  const handleHapus = () => {
    if (!isAdmin || !selectedBarang) return;

    repository.delete(selectedBarang.id);
    onDataChanged();
    clearForm();
    setAlertState({
      isOpen: true,
      title: 'Barang Dihapus',
      message: `Data barang '${selectedBarang.namaBarang}' telah dihapus dari sistem.`
    });
  };

  const categories = ['Semua', ...Array.from(new Set(barangList.map(b => b.kategori || 'Umum')))];

  const filtered = barangList.filter(item => {
    const matchCat = categoryFilter === 'Semua' || item.kategori === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      item.idBarang.toLowerCase().includes(q) ||
      item.namaBarang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      item.satuan.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const lowStockCount = barangList.filter(b => b.stok <= b.minStok && b.stok > 0).length;
  const outOfStockCount = barangList.filter(b => b.stok === 0).length;
  const totalStokFisik = barangList.reduce((acc, curr) => acc + curr.stok, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats Summary Cards */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Item Katalog</h4>
            <div className="stat-value">{barangList.length} Barang</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Stok Fisik</h4>
            <div className="stat-value">{totalStokFisik.toLocaleString()} Unit/Pcs</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h4>Stok Menipis (&le; Min)</h4>
            <div className="stat-value" style={{ color: lowStockCount > 0 ? '#d97706' : '#1e293b' }}>
              {lowStockCount} Item
            </div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <h4>Stok Habis (0)</h4>
            <div className="stat-value" style={{ color: outOfStockCount > 0 ? '#dc2626' : '#1e293b' }}>
              {outOfStockCount} Item
            </div>
          </div>
        </div>
      </div>

      {/* Role Notice Banner */}
      {!isAdmin ? (
        <div style={{
          padding: '12px 18px',
          background: '#eff6ff',
          borderRadius: '10px',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          <Info size={20} color="#2563eb" />
          <div>
            <strong>Akses Operasional Petugas Gudang:</strong> Anda dapat memantau katalog ketersediaan stok fisik dan limit minimum. Formulir penambahan dan pengelolaan data master barang baru hanya dapat diakses oleh <strong>Admin (Akses Penuh)</strong>.
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px 18px',
          background: '#fef2f2',
          borderRadius: '10px',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#991b1b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#dc2626" />
            <span>
              <strong>Mode Administrator Aktif:</strong> Anda memiliki hak akses penuh untuk menambah, mengubah, menonaktifkan, atau menghapus data master barang gudang.
            </span>
          </div>
        </div>
      )}

      {/* TABLE CARD */}
      <section className="gudang-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Katalog Data Master Barang</h2>
            <p className="section-desc">Daftar lengkap inventaris barang, kategori, limit stok minimum, dan ketersediaan fisik</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="#64748b" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-field"
                style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari nama / kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-field"
                style={{ paddingLeft: '32px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="barang-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th style={{ width: '130px' }}>Kode Barang</th>
                <th>Nama Barang</th>
                <th style={{ width: '160px' }}>Kategori</th>
                <th style={{ width: '90px' }}>Stok</th>
                <th style={{ width: '110px' }}>Limit Min</th>
                <th style={{ width: '100px' }}>Satuan</th>
                <th style={{ width: '130px' }}>Status Stok</th>
                <th style={{ width: '90px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    {searchQuery || categoryFilter !== 'Semua'
                      ? 'Tidak ditemukan barang yang sesuai dengan filter pencarian.'
                      : 'Belum ada data barang di sistem.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = selectedBarang?.id === item.id;
                  let stockBadgeClass = 'badge-status-aman';
                  let stockStatusText = 'Aman';

                  if (item.stok === 0) {
                    stockBadgeClass = 'badge-status-habis';
                    stockStatusText = 'Habis (0)';
                  } else if (item.stok <= item.minStok) {
                    stockBadgeClass = 'badge-status-menipis';
                    stockStatusText = 'Menipis';
                  }

                  return (
                    <tr
                      key={item.id}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => handleSelectBarang(item)}
                      title="Klik baris untuk memuat rincian data"
                    >
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.idBarang}</td>
                      <td style={{ fontWeight: 600 }}>
                        {item.namaBarang}
                        {item.keterangan && (
                          <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748b', fontWeight: 400 }}>
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge-kategori">{item.kategori}</span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '15px' }}>{item.stok}</td>
                      <td style={{ color: isSelected ? '#ffffff' : '#64748b' }}>{item.minStok} {item.satuan}</td>
                      <td>
                        <span className="badge-satuan">{item.satuan}</span>
                      </td>
                      <td>
                        <span className={stockBadgeClass}>{stockStatusText}</span>
                      </td>
                      <td>
                        <span className={item.status === 'aktif' ? 'badge-active' : 'badge-inactive'}>
                          {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedBarang && !isAdmin && (
          <div style={{
            background: '#f8fafc',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginTop: '8px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Rincian Barang Terpilih: {selectedBarang.namaBarang} ({selectedBarang.idBarang})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '13px' }}>
              <div>Kategori: <strong>{selectedBarang.kategori}</strong></div>
              <div>Stok Saat Ini: <strong>{selectedBarang.stok} {selectedBarang.satuan}</strong></div>
              <div>Limit Minimum: <strong>{selectedBarang.minStok} {selectedBarang.satuan}</strong></div>
              <div>Status: <strong>{selectedBarang.status === 'aktif' ? 'Aktif Ditransaksikan' : 'Nonaktif'}</strong></div>
              {selectedBarang.keterangan && <div style={{ gridColumn: 'span 2' }}>Catatan: <em>{selectedBarang.keterangan}</em></div>}
            </div>
          </div>
        )}
      </section>

      {/* FORM CARD (HANYA DITAMPILKAN UNTUK ADMIN SESUAI PERMINTAAN USER) */}
      {isAdmin && (
        <section className="gudang-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Form Pemeliharaan Master Barang (Khusus Admin)</h2>
              <p className="section-desc">
                Tambah identitas barang baru atau ubah data katalog (Kode, Nama, Kategori, Satuan, Limit Stok Minimum).
              </p>
            </div>
            {selectedBarang && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearForm}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <RotateCcw size={14} />
                Reset Form / Batal Seleksi
              </button>
            )}
          </div>

          <form onSubmit={handleTambah} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-grid">
              <div className="form-item">
                <label>Kode Barang *</label>
                <input
                  type="text"
                  placeholder="Contoh: BRG009"
                  value={idBarang}
                  onChange={(e) => setIdBarang(e.target.value)}
                  className="text-field"
                  required
                />
              </div>

              <div className="form-item">
                <label>Nama Barang *</label>
                <input
                  type="text"
                  placeholder="Contoh: SSD NVMe Samsung 980 1TB"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  className="text-field"
                  required
                />
              </div>

              <div className="form-item">
                <label>Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="select-field"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Aksesoris Komputer">Aksesoris Komputer</option>
                  <option value="Kabel & Konektor">Kabel & Konektor</option>
                  <option value="Alat Tulis Kantor">Alat Tulis Kantor</option>
                  <option value="Kemasan & Logistik">Kemasan & Logistik</option>
                  <option value="Komponen Hardware">Komponen Hardware</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div className="form-item">
                <label>Satuan Barang *</label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className="select-field"
                >
                  <option value="Unit">Unit</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Box">Box</option>
                  <option value="Dus">Dus</option>
                  <option value="Kg">Kg</option>
                  <option value="Meter">Meter</option>
                  <option value="Rim">Rim</option>
                  <option value="Roll">Roll</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>

              <div className="form-item">
                <label>Stok Fisik Awal</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 50"
                  value={stok}
                  onChange={(e) => setStok(e.target.value)}
                  className="text-field"
                />
              </div>

              <div className="form-item">
                <label>Limit Stok Minimum (Safety Stock) *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 10"
                  value={minStok}
                  onChange={(e) => setMinStok(e.target.value)}
                  className="text-field"
                  required
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Peringatan otomatis aktif saat stok mencapai batas ini.</span>
              </div>

              <div className="form-item">
                <label>Status Katalog</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="select-field"
                >
                  <option value="aktif">Aktif (Dapat Ditransaksikan)</option>
                  <option value="nonaktif">Nonaktif (Arsip / Disimpan Aman)</option>
                </select>
              </div>

              <div className="form-item" style={{ gridColumn: 'span 2' }}>
                <label>Keterangan / Spesifikasi Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Garansi resmi 1 tahun / Lokasi Rak A-3"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="text-field"
                />
              </div>
            </div>

            <div className="action-toolbar">
              <div className="button-group-left">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTambah}
                  title="Simpan barang baru ke katalog master"
                >
                  <Plus size={16} />
                  Tambah Barang Baru
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleUbah}
                  disabled={!selectedBarang}
                  title="Perbarui data barang terpilih"
                >
                  <Edit2 size={16} />
                  Ubah Detail Barang
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleToggleStatus}
                  disabled={!selectedBarang}
                  title="Nonaktifkan barang tanpa menghapus riwayat transaksi"
                >
                  {status === 'aktif' ? <ToggleLeft size={16} color="#d97706" /> : <ToggleRight size={16} color="#16a34a" />}
                  {status === 'aktif' ? 'Nonaktifkan (Amankan Riwayat)' : 'Aktifkan Kembali'}
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleHapus}
                  disabled={!selectedBarang}
                  title="Hapus data barang secara permanen"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>

              <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Hak Akses Penuh Admin
              </span>
            </div>
          </form>
        </section>
      )}

      <AlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
};
