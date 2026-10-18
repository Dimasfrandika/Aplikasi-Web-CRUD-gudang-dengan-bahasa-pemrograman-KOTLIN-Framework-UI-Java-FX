import React, { useState, useEffect } from 'react';
import { Barang, TransaksiBarangKeluar, TransaksiItem, UserSession } from '../types';
import { TransaksiKeluarRepository } from '../services/storage';
import { AlertDialog } from './AlertDialog';
import { BuktiPengeluaranModal } from './BuktiPengeluaranModal';
import { SearchableBarangPicker } from './SearchableBarangPicker';
import {
  ArrowUpFromLine,
  FileText,
  Search,
  RotateCcw,
  MinusCircle,
  AlertTriangle,
  Send,
  Calendar,
  Hash,
  Plus,
  Trash2,
  Printer,
  UserCheck
} from 'lucide-react';

interface BarangKeluarViewProps {
  session: UserSession;
  barangList: Barang[];
  transaksiList?: TransaksiBarangKeluar[];
  onDataChanged: () => void;
}

export const BarangKeluarView: React.FC<BarangKeluarViewProps> = ({
  session,
  barangList,
  transaksiList: externalTransaksiList,
  onDataChanged
}) => {
  const repository = new TransaksiKeluarRepository();
  const [transaksiList, setTransaksiList] = useState<TransaksiBarangKeluar[]>(
    () => externalTransaksiList || repository.getAll()
  );

  useEffect(() => {
    if (externalTransaksiList) {
      setTransaksiList(externalTransaksiList);
    }
  }, [externalTransaksiList]);

  // Form Fields
  const today = new Date().toISOString().split('T')[0];
  const generateDocNum = () =>
    `BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(repository.getAll().length + 1).padStart(3, '0')}`;

  const [noDokumen, setNoDokumen] = useState(generateDocNum);
  const [tanggal, setTanggal] = useState(today);
  const [tujuan, setTujuan] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Multi-item Draft List
  const [draftItems, setDraftItems] = useState<TransaksiItem[]>([]);

  // Item Input Draft
  const [selectedBarangId, setSelectedBarangId] = useState<string>(barangList[0]?.id.toString() || '');
  const [itemJumlah, setItemJumlah] = useState('1');
  const [itemKeterangan, setItemKeterangan] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Bukti Modal State
  const [modalTransaksi, setModalTransaksi] = useState<TransaksiBarangKeluar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert State
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

  const activeBarangList = barangList.filter(b => b.status === 'aktif');
  const currentSelectedBarang = barangList.find(b => b.id.toString() === selectedBarangId);

  // Compute already added quantity in draft for this item
  const alreadyAddedInDraft = draftItems
    .filter(i => i.barangId.toString() === selectedBarangId)
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const availableAfterDraft = currentSelectedBarang ? currentSelectedBarang.stok - alreadyAddedInDraft : 0;
  const parsedItemJumlah = parseInt(itemJumlah, 10) || 0;
  const isItemOverStock = parsedItemJumlah > availableAfterDraft;

  // Add Item to Draft
  const handleAddItemToDraft = () => {
    if (!currentSelectedBarang) {
      setAlertState({
        isOpen: true,
        title: 'Pilih Barang',
        message: 'Silakan pilih barang yang akan ditambahkan ke daftar transaksi pengeluaran!'
      });
      return;
    }

    if (parsedItemJumlah <= 0) {
      setAlertState({
        isOpen: true,
        title: 'Jumlah Tidak Valid',
        message: 'Jumlah barang keluar harus lebih dari 0!'
      });
      return;
    }

    if (parsedItemJumlah > availableAfterDraft) {
      setAlertState({
        isOpen: true,
        title: 'Stok Tidak Mencukupi',
        message: `Stok barang '${currentSelectedBarang.namaBarang}' tidak mencukupi! Tersedia saat ini: ${availableAfterDraft} ${currentSelectedBarang.satuan}.`
      });
      return;
    }

    // Check if already in draft, aggregate or append
    const existingIndex = draftItems.findIndex(i => i.barangId === currentSelectedBarang.id);
    if (existingIndex !== -1) {
      const updated = [...draftItems];
      updated[existingIndex].jumlah += parsedItemJumlah;
      if (itemKeterangan.trim()) {
        updated[existingIndex].keterangan = itemKeterangan.trim();
      }
      setDraftItems(updated);
    } else {
      const newItem: TransaksiItem = {
        barangId: currentSelectedBarang.id,
        idBarang: currentSelectedBarang.idBarang,
        namaBarang: currentSelectedBarang.namaBarang,
        jumlah: parsedItemJumlah,
        satuan: currentSelectedBarang.satuan,
        keterangan: itemKeterangan.trim()
      };
      setDraftItems([...draftItems, newItem]);
    }

    setItemJumlah('1');
    setItemKeterangan('');
  };

  const handleRemoveDraftItem = (index: number) => {
    const updated = draftItems.filter((_, idx) => idx !== index);
    setDraftItems(updated);
  };

  const clearForm = () => {
    setNoDokumen(generateDocNum());
    setTanggal(today);
    setTujuan('');
    setNamaPenerima('');
    setKeterangan('');
    setDraftItems([]);
    setItemJumlah('1');
    setItemKeterangan('');
  };

  // Submit Entire Transaction
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (draftItems.length === 0) {
      setAlertState({
        isOpen: true,
        title: 'Daftar Barang Masih Kosong',
        message: 'Mohon tambahkan minimal 1 jenis barang ke dalam daftar pengeluaran sebelum menyimpan!'
      });
      return;
    }

    if (!tujuan.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Tujuan Gagal',
        message: 'Tujuan pengeluaran / Departemen penerima wajib diisi!'
      });
      return;
    }

    if (!namaPenerima.trim()) {
      setAlertState({
        isOpen: true,
        title: 'Validasi Nama Penerima Gagal',
        message: 'Nama penerima barang wajib diisi langsung pada input pengeluaran!'
      });
      return;
    }

    const result = repository.insert({
      noDokumen: noDokumen.trim(),
      tanggal: tanggal,
      tujuan: tujuan.trim(),
      namaPenerima: namaPenerima.trim(),
      keterangan: keterangan.trim() || 'Pengeluaran logistik barang',
      petugas: session.nama || session.email || 'Petugas Gudang',
      items: draftItems
    });

    if (result.success && result.data) {
      const savedTransaksi = result.data;
      setTransaksiList(repository.getAll());
      onDataChanged();
      clearForm();

      // Show success dialog with direct option to print
      setAlertState({
        isOpen: true,
        title: 'Transaksi Berhasil Disimpan!',
        message: `Dokumen pengeluaran ${savedTransaksi.noDokumen} berisi ${savedTransaksi.items.length} jenis barang berhasil disetujui. Stok otomatis terpotong di database. Klik OK untuk langsung membuka Bukti Serah Terima / Surat Jalan cetak PDF.`,
        onDismiss: () => {
          setModalTransaksi(savedTransaksi);
          setIsModalOpen(true);
        }
      });
    } else {
      setAlertState({
        isOpen: true,
        title: 'Gagal Memproses Pengeluaran',
        message: result.message || 'Terjadi kesalahan saat memproses transaksi barang keluar.'
      });
    }
  };

  const handleOpenPrintModal = (item: TransaksiBarangKeluar) => {
    setModalTransaksi(item);
    setIsModalOpen(true);
  };

  const filteredTransaksi = transaksiList.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchItems = t.items?.some(i => i.namaBarang.toLowerCase().includes(q) || i.idBarang.toLowerCase().includes(q));
    return (
      t.noDokumen.toLowerCase().includes(q) ||
      t.tujuan.toLowerCase().includes(q) ||
      t.namaPenerima?.toLowerCase().includes(q) ||
      t.petugas.toLowerCase().includes(q) ||
      matchItems
    );
  });

  const totalItemDraft = draftItems.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Overview */}
      <div style={{
        background: 'linear-gradient(to right, #b91c1c, #ef4444)',
        padding: '18px 24px',
        borderRadius: '14px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
            <ArrowUpFromLine size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Pengeluaran Barang Keluar (Multi-Item Transaksi)</h2>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Bisa memproses banyak jenis barang dalam 1 dokumen pengeluaran, dilengkapi input Nama Penerima dan cetak Surat Jalan / Bukti PDF.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 }}>Total Dokumen Keluar</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{transaksiList.length} Transaksi</div>
          </div>
        </div>
      </div>

      {/* FORM DOKUMEN PENGELUARAN MULTI-ITEM */}
      <section className="gudang-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Formulir Dokumen Pengeluaran Barang</h2>
            <p className="section-desc">
              Lengkapi informasi dokumen, nama penerima fisik barang, serta tambahkan barang-barang yang akan diserahkan
            </p>
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

        <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Dokumen Fields */}
          <div className="form-grid">
            <div className="form-item">
              <label>Nomor Dokumen Pengeluaran *</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  value={noDokumen}
                  onChange={(e) => setNoDokumen(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px', fontWeight: 700, color: '#b91c1c' }}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>Tanggal Pengeluaran *</label>
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
              <label>Tujuan / Departemen Penerima *</label>
              <div style={{ position: 'relative' }}>
                <Send size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Contoh: Divisi IT & Jaringan / Toko Cabang Selatan"
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px' }}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>Nama Lengkap Penerima Barang *</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#2563eb' }} />
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Riyadi (Teknisi) / Bpk. Gunawan"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value)}
                  className="text-field"
                  style={{ paddingLeft: '34px', borderColor: '#93c5fd', backgroundColor: '#f8fafc' }}
                  required
                />
              </div>
              <span style={{ fontSize: '11px', color: '#2563eb' }}>Nama penerima akan langsung dicetak pada lembar serah terima barang</span>
            </div>

            <div className="form-item" style={{ gridColumn: 'span 2' }}>
              <label>Keterangan / Keperluan Transaksi</label>
              <input
                type="text"
                placeholder="Contoh: Pengadaan perlengkapan proyek baru (SPB No. 042/IT/2026)"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
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
                <Plus size={16} color="#2563eb" />
                Tambah Barang ke Dokumen (Bisa Lebih Dari 1 Barang)
              </h3>
              {currentSelectedBarang && (
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Stok Fisik Tersedia: <strong>{availableAfterDraft} {currentSelectedBarang.satuan}</strong>
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
              <SearchableBarangPicker
                barangList={activeBarangList}
                selectedBarangId={selectedBarangId}
                onSelectBarang={(b) => setSelectedBarangId(b.id.toString())}
                getAvailableStock={(b) => {
                  const inDraft = draftItems
                    .filter(i => i.barangId === b.id)
                    .reduce((acc, curr) => acc + curr.jumlah, 0);
                  return b.stok - inDraft;
                }}
                label="Cari & Pilih Barang Keluar"
                placeholder="Ketik kode atau nama barang..."
              />

              <div className="form-item">
                <label style={{ fontSize: '12px' }}>Jumlah Keluar</label>
                <input
                  type="number"
                  min="1"
                  max={availableAfterDraft > 0 ? availableAfterDraft : 1}
                  value={itemJumlah}
                  onChange={(e) => setItemJumlah(e.target.value)}
                  className="text-field"
                  style={{
                    fontSize: '13px',
                    borderColor: isItemOverStock ? '#ef4444' : undefined,
                    backgroundColor: isItemOverStock ? '#fef2f2' : undefined
                  }}
                />
              </div>

              <div className="form-item">
                <label style={{ fontSize: '12px' }}>Catatan Per Barang (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Unit warna hitam / Segel baru"
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
                disabled={isItemOverStock || parsedItemJumlah <= 0 || availableAfterDraft <= 0}
                style={{ height: '42px', padding: '0 16px', fontSize: '13px' }}
              >
                <Plus size={16} />
                + Tambah ke Daftar
              </button>
            </div>

            {isItemOverStock && (
              <div style={{ fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> Jumlah yang diminta ({parsedItemJumlah}) melebihi stok yang tersisa ({availableAfterDraft})!
              </div>
            )}
          </div>

          {/* TABEL DRAFT BARANG YANG AKAN DIKELUARKAN */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Daftar Barang dalam Dokumen Transaksi ({draftItems.length} jenis barang, Total: {totalItemDraft} kuantitas)
              </h4>
            </div>

            <div className="table-container">
              <table className="barang-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '40px' }}>No</th>
                    <th style={{ width: '130px' }}>Kode Barang</th>
                    <th>Nama Barang</th>
                    <th style={{ width: '120px' }}>Jumlah Keluar</th>
                    <th style={{ width: '100px' }}>Satuan</th>
                    <th>Catatan Item</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {draftItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        Belum ada barang yang dimasukkan. Silakan pilih barang di atas dan klik <strong>"+ Tambah ke Daftar"</strong>.
                      </td>
                    </tr>
                  ) : (
                    draftItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{item.idBarang}</td>
                        <td style={{ fontWeight: 600 }}>{item.namaBarang}</td>
                        <td style={{ fontWeight: 800, color: '#b91c1c' }}>-{item.jumlah}</td>
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
              className="btn btn-danger"
              disabled={draftItems.length === 0 || !namaPenerima.trim() || !tujuan.trim()}
              style={{ fontSize: '14px', padding: '12px 24px' }}
            >
              <MinusCircle size={18} />
              Setujui Transaksi & Kurangi Stok Seluruh Barang
            </button>

            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Petugas Validasi: <strong>{session.nama || session.email}</strong>
            </span>
          </div>
        </form>
      </section>

      {/* RIWAYAT PENGELUARAN TABLE DENGAN OPSI CETAK SURAT JALAN / BAST */}
      <section className="gudang-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#b91c1c" />
            <div>
              <h2 className="section-title">Riwayat Dokumen Pengeluaran Barang Keluar</h2>
              <p className="section-desc">Daftar arsip dokumen pengeluaran resmi dengan tombol cetak bukti serah terima</p>
            </div>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari no. dok / penerima / barang..."
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
                <th style={{ width: '160px' }}>Tujuan / Divisi</th>
                <th style={{ width: '160px' }}>Nama Penerima</th>
                <th>Rincian Barang yang Dikeluarkan</th>
                <th style={{ width: '120px' }}>Petugas</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Bukti Cetak</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    {searchQuery ? 'Tidak ada transaksi keluar yang sesuai dengan pencarian.' : 'Belum ada riwayat transaksi barang keluar.'}
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item, idx) => {
                  const itemCount = item.items?.length || 1;
                  const totalQty = item.items?.reduce((acc, curr) => acc + curr.jumlah, 0) || item.jumlah || 0;

                  return (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#b91c1c' }}>{item.noDokumen}</td>
                      <td>{item.tanggal}</td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{item.tujuan}</td>
                      <td style={{ fontWeight: 700, color: '#1e40af' }}>{item.namaPenerima}</td>
                      <td>
                        {item.items && item.items.length > 0 ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {item.items.map(i => `${i.namaBarang} (${i.jumlah} ${i.satuan})`).join(', ')}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Total: <strong>{itemCount} jenis barang</strong> ({totalQty} total unit)
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.namaBarang}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>-{item.jumlah} {item.satuan}</div>
                          </div>
                        )}
                      </td>
                      <td>{item.petugas}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleOpenPrintModal(item)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            borderColor: '#2563eb',
                            color: '#2563eb',
                            display: 'inline-flex',
                            gap: '4px'
                          }}
                          title="Cetak Bukti Pengeluaran Barang / Surat Jalan PDF"
                        >
                          <Printer size={13} />
                          Cetak Bukti
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Bukti Pengeluaran Cetak / Simpan PDF */}
      {isModalOpen && modalTransaksi && (
        <BuktiPengeluaranModal
          isOpen={isModalOpen}
          transaksi={modalTransaksi}
          onClose={() => {
            setIsModalOpen(false);
            setModalTransaksi(null);
          }}
        />
      )}

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
