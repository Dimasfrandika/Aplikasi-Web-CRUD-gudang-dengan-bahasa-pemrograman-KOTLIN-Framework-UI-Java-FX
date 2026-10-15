import React, { useState } from 'react';
import { Barang, TransaksiBarangMasuk, TransaksiItem, UserSession } from '../types';
import { TransaksiMasukRepository } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { SearchableBarangPicker } from './SearchableBarangPicker';
import {
  ArrowDownToLine,
  Truck,
  FileCheck,
  Search,
  RotateCcw,
  PlusCircle,
  Building2,
  Calendar,
  Hash,
  Plus,
  Trash2
} from 'lucide-react';

interface BarangMasukViewProps {
  session: UserSession;
  barangList: Barang[];
  onDataChanged: () => void;
}

export const BarangMasukView: React.FC<BarangMasukViewProps> = ({
  session,
  barangList,
  onDataChanged
}) => {
  const repository = new TransaksiMasukRepository();
  const [transaksiList, setTransaksiList] = useState<TransaksiBarangMasuk[]>(() => repository.getAll());

  // Form Fields
  const today = new Date().toISOString().split('T')[0];
  const generateDocNum = () =>
    `BM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(repository.getAll().length + 1).padStart(3, '0')}`;

  const [noDokumen, setNoDokumen] = useState(generateDocNum);
  const [tanggal, setTanggal] = useState(today);
  const [supplier, setSupplier] = useState('');
  const [noSuratJalan, setNoSuratJalan] = useState('');
  const [catatan, setCatatan] = useState('');

  // Multi-item Draft List
  const [draftItems, setDraftItems] = useState<TransaksiItem[]>([]);

  // Item Input Draft
  const [selectedBarangId, setSelectedBarangId] = useState<string>(barangList[0]?.id.toString() || '');
  const [itemJumlah, setItemJumlah] = useState('10');
  const [itemKeterangan, setItemKeterangan] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Alert State
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const activeBarangList = barangList.filter(b => b.status === 'aktif');
  const currentSelectedBarang = barangList.find(b => b.id.toString() === selectedBarangId);

  const handleAddItemToDraft = () => {
    if (!currentSelectedBarang) {
      setAlertState({
        isOpen: true,
        title: 'Pilih Barang',
        message: 'Silakan pilih barang yang akan ditambahkan ke daftar penerimaan!'
      });
      return;
    }

    const parsedJumlah = parseInt(itemJumlah, 10);
    if (isNaN(parsedJumlah) || parsedJumlah <= 0) {
      setAlertState({
        isOpen: true,
        title: 'Jumlah Tidak Valid',
        message: 'Jumlah masuk harus berupa angka positif lebih dari 0!'
      });
      return;
    }

    // Check if item already exists in draft
    const existingIndex = draftItems.findIndex(i => i.barangId === currentSelectedBarang.id);
    if (existingIndex !== -1) {
      const updated = [...draftItems];
      updated[existingIndex].jumlah += parsedJumlah;
      if (itemKeterangan.trim()) {
        updated[existingIndex].keterangan = itemKeterangan.trim();
      }
      setDraftItems(updated);
    } else {
      const newItem: TransaksiItem = {
        barangId: currentSelectedBarang.id,
        idBarang: currentSelectedBarang.idBarang,
        namaBarang: currentSelectedBarang.namaBarang,
        jumlah: parsedJumlah,
        satuan: currentSelectedBarang.satuan,
        keterangan: itemKeterangan.trim()
      };
      setDraftItems([...draftItems, newItem]);
    }

    setItemJumlah('10');
    setItemKeterangan('');
  };

  const handleRemoveDraftItem = (index: number) => {
    setDraftItems(draftItems.filter((_, idx) => idx !== index));
  };

  const clearForm = () => {
    setNoDokumen(generateDocNum());
    setTanggal(today);
    setSupplier('');
    setNoSuratJalan('');
    setCatatan('');
    setDraftItems([]);
    setItemJumlah('10');
    setItemKeterangan('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (draftItems.length === 0) {
      setAlertState({
        isOpen: true,
        title: 'Daftar Barang Kosong',
        message: 'Harap tambahkan minimal 1 barang ke dalam dokumen penerimaan!'
      });
      return;
    }

    if (!supplier.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Gagal',
        message: 'Nama supplier / vendor pemasok wajib diisi!'
      });
      return;
    }

    if (!noSuratJalan.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Gagal',
        message: 'Nomor referensi Surat Jalan (No. SJ / DO) dari supplier wajib diisi!'
      });
      return;
    }

    const result = repository.insert({
      noDokumen: noDokumen.trim(),
      tanggal: tanggal,
      supplier: supplier.trim(),
      noSuratJalan: noSuratJalan.trim(),
      petugas: session.nama || session.email || 'Petugas Gudang',
      catatan: catatan.trim(),
      items: draftItems
    });

    if (result.success && result.data) {
      setTransaksiList(repository.getAll());
      onDataChanged();
      clearForm();

      setAlertState({
        isOpen: true,
        title: 'Penerimaan Berhasil Dicatat',
        message: `Dokumen ${result.data.noDokumen} berisi ${result.data.items.length} jenis barang berhasil disimpan! Stok masing-masing barang otomatis bertambah di database Master.`
      });
    } else {
      setAlertState({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: result.message || 'Terjadi kesalahan saat memproses barang masuk.'
      });
    }
  };

  const filteredTransaksi = transaksiList.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchItems = t.items?.some(i => i.namaBarang.toLowerCase().includes(q) || i.idBarang.toLowerCase().includes(q));
    return (
      t.noDokumen.toLowerCase().includes(q) ||
      t.supplier.toLowerCase().includes(q) ||
      t.noSuratJalan.toLowerCase().includes(q) ||
      t.petugas.toLowerCase().includes(q) ||
      matchItems
    );
  });

  const totalItemDraft = draftItems.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Overview */}
      <div style={{
        background: 'linear-gradient(to right, #059669, #10b981)',
        padding: '18px 24px',
        borderRadius: '14px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
            <ArrowDownToLine size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Penerimaan Barang Masuk (Multi-Item Transaksi)</h2>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Mendukung banyak item barang dalam 1 surat jalan pasokan. Stok masing-masing barang otomatis diperbarui di database.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 }}>Total Dokumen Masuk</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{transaksiList.length} Penerimaan</div>
          </div>
        </div>
      </div>

      {/* DOKUMEN PENERIMAAN FORM MULTI-ITEM */}
      <section className="gudang-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Formulir Penerimaan Barang Masuk</h2>
            <p className="section-desc">Lengkapi dokumen surat jalan supplier dan masukkan daftar barang yang diterima</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearForm}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <RotateCcw size={14} />
            Reset Form
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Dokumen */}
          <div className="form-grid">
            <div className="form-item">
              <label>Nomor Dokumen Penerimaan *</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  value={noDokumen}
                  onChange={(e) => setNoDokumen(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px', fontWeight: 700, color: '#047857' }}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>Tanggal Penerimaan *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px' }}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>Nama Supplier / Pemasok *</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Contoh: PT Asus Indonesia Tech"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px' }}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>No. Referensi Surat Jalan (DO) *</label>
              <div style={{ position: 'relative' }}>
                <Truck size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Contoh: SJ-ASUS/2026/10/881"
                  value={noSuratJalan}
                  onChange={(e) => setNoSuratJalan(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px' }}
                  required
                />
              </div>
            </div>

            <div className="form-item" style={{ gridColumn: 'span 2' }}>
              <label>Catatan Pemeriksaan Penerimaan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Segel aman, kondisi kardus baik, seluruh barang lolos QC gudang"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="text-field"
              />
            </div>
          </div>

          {/* ITEM ADDITION BOX (MULTI-BARANG BUILDER) */}
          <div style={{
            background: '#f8fafc',
            padding: '18px',
            borderRadius: '12px',
            border: '1.5px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} color="#059669" />
                Tambah Barang ke Dokumen Penerimaan (Bisa Lebih Dari 1 Barang)
              </h3>
              {currentSelectedBarang && (
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Stok Gudang Saat Ini: <strong>{currentSelectedBarang.stok} {currentSelectedBarang.satuan}</strong>
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
              <SearchableBarangPicker
                barangList={activeBarangList}
                selectedBarangId={selectedBarangId}
                onSelectBarang={(b) => setSelectedBarangId(b.id.toString())}
                label="Cari & Pilih Barang Masuk"
                placeholder="Ketik kode atau nama barang..."
              />

              <div className="form-item">
                <label style={{ fontSize: '12px' }}>Jumlah Masuk</label>
                <input
                  type="number"
                  min="1"
                  value={itemJumlah}
                  onChange={(e) => setItemJumlah(e.target.value)}
                  className="text-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              <div className="form-item">
                <label style={{ fontSize: '12px' }}>Keterangan / Catatan Item (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Batch No. B-482"
                  value={itemKeterangan}
                  onChange={(e) => setItemKeterangan(e.target.value)}
                  className="text-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddItemToDraft}
                style={{ height: '42px', padding: '0 16px', fontSize: '13px', background: '#059669' }}
              >
                <Plus size={16} />
                + Tambah ke Daftar
              </button>
            </div>
          </div>

          {/* TABEL DRAFT BARANG YANG AKAN DITERIMA */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Daftar Barang dalam Dokumen ({draftItems.length} jenis barang, Total: {totalItemDraft} kuantitas)
              </h4>
            </div>

            <div className="table-container">
              <table className="barang-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '40px' }}>No</th>
                    <th style={{ width: '130px' }}>Kode Barang</th>
                    <th>Nama Barang</th>
                    <th style={{ width: '120px' }}>Jumlah Masuk</th>
                    <th style={{ width: '100px' }}>Satuan</th>
                    <th>Catatan Item</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {draftItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        Belum ada barang dalam daftar. Pilih barang dan klik <strong>"+ Tambah ke Daftar"</strong>.
                      </td>
                    </tr>
                  ) : (
                    draftItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{item.idBarang}</td>
                        <td style={{ fontWeight: 600 }}>{item.namaBarang}</td>
                        <td style={{ fontWeight: 800, color: '#059669' }}>+{item.jumlah}</td>
                        <td>
                          <span className="badge-satuan">{item.satuan}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>{item.keterangan || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftItem(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Hapus baris barang ini"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="action-toolbar">
            <button
              type="submit"
              className="btn btn-success"
              disabled={draftItems.length === 0 || !supplier.trim() || !noSuratJalan.trim()}
              style={{ fontSize: '14px', padding: '12px 24px' }}
            >
              <PlusCircle size={18} />
              Simpan Dokumen Penerimaan & Tambah Stok Seluruh Barang
            </button>

            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Petugas Pencatat: <strong>{session.nama || session.email}</strong>
            </span>
          </div>
        </form>
      </section>

      {/* RIWAYAT TRANSAKSI BARANG MASUK TABLE */}
      <section className="gudang-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={20} color="#059669" />
            <div>
              <h2 className="section-title">Riwayat Dokumen Penerimaan Barang Masuk</h2>
              <p className="section-desc">Daftar arsip pencatatan pasokan masuk dari supplier dengan rincian multi-item</p>
            </div>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari no. dok / supplier / barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-field"
              style={{ paddingLeft: '32px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="barang-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th style={{ width: '150px' }}>No. Dokumen</th>
                <th style={{ width: '100px' }}>Tanggal</th>
                <th>Rincian Barang yang Diterima</th>
                <th style={{ width: '180px' }}>Supplier / Pemasok</th>
                <th style={{ width: '160px' }}>No. Surat Jalan</th>
                <th style={{ width: '130px' }}>Petugas</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    {searchQuery ? 'Tidak ada transaksi masuk yang sesuai dengan kata kunci pencarian.' : 'Belum ada riwayat transaksi barang masuk.'}
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item, idx) => {
                  const itemCount = item.items?.length || 1;
                  const totalQty = item.items?.reduce((acc, curr) => acc + curr.jumlah, 0) || item.jumlah || 0;

                  return (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>{item.noDokumen}</td>
                      <td>{item.tanggal}</td>
                      <td>
                        {item.items && item.items.length > 0 ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {item.items.map(i => `${i.namaBarang} (+${i.jumlah} ${i.satuan})`).join(', ')}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Total: <strong>{itemCount} jenis barang</strong> (+{totalQty} total unit)
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.namaBarang}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>+{item.jumlah} {item.satuan}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{item.supplier}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.noSuratJalan}</td>
                      <td>{item.petugas}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
};
