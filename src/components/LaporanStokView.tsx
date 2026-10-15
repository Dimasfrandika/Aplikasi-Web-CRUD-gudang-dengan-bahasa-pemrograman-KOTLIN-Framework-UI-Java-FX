import React, { useState, useEffect } from 'react';
import {
  Barang,
  TransaksiBarangMasuk,
  TransaksiBarangKeluar,
  UserSession,
  ReportType
} from '../types';
import { PengaturanService } from '../services/storage';
import {
  Printer,
  Download,
  Filter,
  Calendar,
  Edit3,
  Check,
  ShieldCheck
} from 'lucide-react';

interface LaporanStokViewProps {
  session: UserSession;
  barangList: Barang[];
  transaksiMasuk: TransaksiBarangMasuk[];
  transaksiKeluar: TransaksiBarangKeluar[];
}

export const LaporanStokView: React.FC<LaporanStokViewProps> = ({
  session,
  barangList,
  transaksiMasuk,
  transaksiKeluar
}) => {
  const isAdmin = session.role === 'admin';
  const pengaturan = PengaturanService.getPengaturan();

  const [reportType, setReportType] = useState<ReportType>('sisa_stok');

  // Head of Department configuration state (Requirement 4)
  const [namaKepalaBagian, setNamaKepalaBagian] = useState(pengaturan.namaKepalaBagian);
  const [nipKepalaBagian, setNipKepalaBagian] = useState(pengaturan.nipKepalaBagian);
  const [isEditingKepala, setIsEditingKepala] = useState(false);

  // Dates filter (defaults to current month)
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  useEffect(() => {
    const cur = PengaturanService.getPengaturan();
    setNamaKepalaBagian(cur.namaKepalaBagian);
    setNipKepalaBagian(cur.nipKepalaBagian);
  }, []);

  const handleSaveKepala = () => {
    setIsEditingKepala(false);
    PengaturanService.savePengaturan({
      ...pengaturan,
      namaKepalaBagian: namaKepalaBagian.trim(),
      nipKepalaBagian: nipKepalaBagian.trim()
    });
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `laporan_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'sisa_stok') {
      csvContent += 'No,Kode Barang,Nama Barang,Kategori,Stok Fisik,Limit Min,Satuan,Status Stok,Status Katalog\n';
      filteredBarang.forEach((item, idx) => {
        const stockStatus = item.stok === 0 ? 'Habis' : item.stok <= item.minStok ? 'Menipis' : 'Aman';
        csvContent += `${idx + 1},"${item.idBarang}","${item.namaBarang}","${item.kategori}",${item.stok},${item.minStok},"${item.satuan}","${stockStatus}","${item.status}"\n`;
      });
    } else if (reportType === 'barang_masuk') {
      csvContent += 'No,No Dokumen,Tanggal,Kode Barang,Nama Barang,Jumlah Masuk,Satuan,Supplier,No Surat Jalan,Petugas\n';
      let rowNum = 1;
      filteredMasuk.forEach((doc) => {
        if (doc.items && doc.items.length > 0) {
          doc.items.forEach((item) => {
            csvContent += `${rowNum++},"${doc.noDokumen}","${doc.tanggal}","${item.idBarang}","${item.namaBarang}",${item.jumlah},"${item.satuan}","${doc.supplier}","${doc.noSuratJalan}","${doc.petugas}"\n`;
          });
        } else {
          csvContent += `${rowNum++},"${doc.noDokumen}","${doc.tanggal}","${doc.idBarang || ''}","${doc.namaBarang || ''}",${doc.jumlah || 0},"${doc.satuan || ''}","${doc.supplier}","${doc.noSuratJalan}","${doc.petugas}"\n`;
        }
      });
    } else if (reportType === 'barang_keluar') {
      csvContent += 'No,No Dokumen,Tanggal,Kode Barang,Nama Barang,Jumlah Keluar,Satuan,Tujuan,Nama Penerima,Petugas\n';
      let rowNum = 1;
      filteredKeluar.forEach((doc) => {
        if (doc.items && doc.items.length > 0) {
          doc.items.forEach((item) => {
            csvContent += `${rowNum++},"${doc.noDokumen}","${doc.tanggal}","${item.idBarang}","${item.namaBarang}",${item.jumlah},"${item.satuan}","${doc.tujuan}","${doc.namaPenerima}","${doc.petugas}"\n`;
          });
        } else {
          csvContent += `${rowNum++},"${doc.noDokumen}","${doc.tanggal}","${doc.idBarang || ''}","${doc.namaBarang || ''}",${doc.jumlah || 0},"${doc.satuan || ''}","${doc.tujuan}","${doc.namaPenerima}","${doc.petugas}"\n`;
        }
      });
    } else if (reportType === 'mutasi') {
      csvContent += 'No,Kode Barang,Nama Barang,Kategori,Total Masuk,Total Keluar,Sisa Stok,Satuan\n';
      mutasiData.forEach((item, idx) => {
        csvContent += `${idx + 1},"${item.idBarang}","${item.namaBarang}","${item.kategori}",${item.totalMasuk},${item.totalKeluar},${item.stok},"${item.satuan}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['Semua', ...Array.from(new Set(barangList.map(b => b.kategori || 'Umum')))];

  const filteredBarang = barangList.filter(item => {
    return selectedKategori === 'Semua' || item.kategori === selectedKategori;
  });

  const filteredMasuk = transaksiMasuk.filter(item => {
    const itemDate = item.tanggal;
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
  });

  const filteredKeluar = transaksiKeluar.filter(item => {
    const itemDate = item.tanggal;
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
  });

  // Mutasi Pergerakan Stok Multi-Item Aware
  const mutasiData = filteredBarang.map(barang => {
    let totalMasukItem = 0;
    transaksiMasuk.forEach(m => {
      if ((!startDate || m.tanggal >= startDate) && (!endDate || m.tanggal <= endDate)) {
        if (m.items && m.items.length > 0) {
          m.items.forEach(it => {
            if (it.barangId === barang.id) totalMasukItem += it.jumlah;
          });
        } else if (m.barangId === barang.id) {
          totalMasukItem += (m.jumlah || 0);
        }
      }
    });

    let totalKeluarItem = 0;
    transaksiKeluar.forEach(k => {
      if ((!startDate || k.tanggal >= startDate) && (!endDate || k.tanggal <= endDate)) {
        if (k.items && k.items.length > 0) {
          k.items.forEach(it => {
            if (it.barangId === barang.id) totalKeluarItem += it.jumlah;
          });
        } else if (k.barangId === barang.id) {
          totalKeluarItem += (k.jumlah || 0);
        }
      }
    });

    return {
      ...barang,
      totalMasuk: totalMasukItem,
      totalKeluar: totalKeluarItem
    };
  });

  const reportTitles: Record<ReportType, string> = {
    sisa_stok: 'LAPORAN REKAPITULASI SISA STOK BARANG GUDANG',
    barang_masuk: 'LAPORAN TRANSAKSI PENERIMAAN BARANG MASUK',
    barang_keluar: 'LAPORAN TRANSAKSI PENGELUARAN BARANG KELUAR',
    mutasi: 'LAPORAN MUTASI & ARUS PERGERAKAN STOK BARANG'
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Configuration & Filter Toolbar (HIDDEN IN PRINT) */}
      <section className="gudang-card no-print">
        <div className="section-header">
          <div>
            <h2 className="section-title">Pusat Cetak & Laporan Stok Barang</h2>
            <p className="section-desc">Pilih jenis laporan, tentukan rentang tanggal, dan sesuaikan penandatangan sebelum mencetak</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <Printer size={16} />
              Cetak / Simpan PDF
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Download size={16} />
              Ekspor CSV / Excel
            </button>
          </div>
        </div>

        {/* Filter Selection Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-item">
            <label>Jenis Laporan *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="select-field"
              style={{ fontWeight: 600, color: '#1e3a8a' }}
            >
              <option value="sisa_stok">1. Laporan Sisa Stok Barang</option>
              <option value="barang_masuk">2. Laporan Barang Masuk</option>
              <option value="barang_keluar">3. Laporan Barang Keluar</option>
              <option value="mutasi">4. Laporan Rekapitulasi Mutasi Stok</option>
            </select>
          </div>

          <div className="form-item">
            <label>Filter Kategori</label>
            <div style={{ position: 'relative' }}>
              <Filter size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="select-field"
                style={{ paddingLeft: '32px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-item">
            <label>Tanggal Awal</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-field"
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>

          <div className="form-item">
            <label>Tanggal Akhir</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-field"
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>
        </div>

        {/* Setting Kepala Bagian Box (Requirement 4) */}
        <div style={{
          background: '#f8fafc',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Penandatangan Laporan (Kepala Bagian Gudang): <strong>{namaKepalaBagian}</strong> (NIP: {nipKepalaBagian})
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Nama dan NIP di atas otomatis tercetak pada lembar pengesahan tanda tangan di bawah.
            </div>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsEditingKepala(!isEditingKepala)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Edit3 size={14} />
              {isEditingKepala ? 'Tutup Pengaturan' : 'Ubah Nama Kepala Bagian'}
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Hanya Admin yang dapat mengubah nama kepala bagian
            </span>
          )}
        </div>

        {/* Input Edit Box if open */}
        {isEditingKepala && isAdmin && (
          <div style={{
            background: '#eff6ff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #bfdbfe',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-item">
                <label>Nama Lengkap & Gelar Kepala Bagian</label>
                <input
                  type="text"
                  value={namaKepalaBagian}
                  onChange={(e) => setNamaKepalaBagian(e.target.value)}
                  className="text-field"
                  placeholder="Contoh: Hendrawan Pratama, S.T., M.M."
                />
              </div>

              <div className="form-item">
                <label>NIP / Nomor Identitas Pegawai</label>
                <input
                  type="text"
                  value={nipKepalaBagian}
                  onChange={(e) => setNipKepalaBagian(e.target.value)}
                  className="text-field"
                  placeholder="Contoh: 19840315 200812 1 002"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveKepala}
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                <Check size={14} />
                Simpan & Terapkan ke Dokumen
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DOCUMENT PREVIEW & PRINTABLE CONTAINER */}
      <div className="report-document">
        {/* KOP RESMI LAPORAN */}
        <div className="report-kop">
          <div className="report-kop-left">
            <img
              src="/images/gambar.png"
              alt="Logo Perusahaan"
              className="report-kop-logo"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="report-kop-text">
              <h2>{pengaturan.namaPerusahaan}</h2>
              <p>Departemen Logistik & Pengelolaan Inventaris Gudang</p>
              <p style={{ fontSize: '11px', color: '#64748b' }}>{pengaturan.alamatGudang}</p>
            </div>
          </div>

          <div className="report-kop-meta">
            <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '13px' }}>DOKUMEN RESMI</div>
            <div>Tanggal Cetak: <strong>{todayFormatted}</strong></div>
            <div>Dicetak Oleh: <strong>{session.nama || session.email}</strong> ({session.role?.toUpperCase()})</div>
            {startDate && endDate && reportType !== 'sisa_stok' && (
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                Periode: {startDate} s/d {endDate}
              </div>
            )}
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {reportTitles[reportType]}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Kategori: <strong>{selectedKategori}</strong> | Penanggung Jawab: <strong>{namaKepalaBagian}</strong>
          </p>
        </div>

        {/* 1. LAPORAN SISA STOK TABLE */}
        {reportType === 'sisa_stok' && (
          <div className="table-container">
            <table className="barang-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th style={{ width: '120px' }}>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th style={{ width: '160px' }}>Kategori</th>
                  <th style={{ width: '100px' }}>Stok Fisik</th>
                  <th style={{ width: '100px' }}>Limit Min</th>
                  <th style={{ width: '90px' }}>Satuan</th>
                  <th style={{ width: '120px' }}>Status Stok</th>
                  <th style={{ width: '80px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarang.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>Tidak ada data barang.</td>
                  </tr>
                ) : (
                  filteredBarang.map((b, idx) => {
                    let stockBadge = 'badge-status-aman';
                    let statusLabel = 'Aman';
                    if (b.stok === 0) {
                      stockBadge = 'badge-status-habis';
                      statusLabel = 'Habis';
                    } else if (b.stok <= b.minStok) {
                      stockBadge = 'badge-status-menipis';
                      statusLabel = 'Menipis';
                    }

                    return (
                      <tr key={b.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{b.idBarang}</td>
                        <td style={{ fontWeight: 600 }}>{b.namaBarang}</td>
                        <td>{b.kategori}</td>
                        <td style={{ fontWeight: 700, fontSize: '15px' }}>{b.stok}</td>
                        <td>{b.minStok}</td>
                        <td>{b.satuan}</td>
                        <td>
                          <span className={stockBadge}>{statusLabel}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>{b.status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. LAPORAN BARANG MASUK TABLE (MULTI-ITEM AWARE) */}
        {reportType === 'barang_masuk' && (
          <div className="table-container">
            <table className="barang-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th style={{ width: '150px' }}>No. Dokumen</th>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th>Rincian Barang Diterima</th>
                  <th style={{ width: '180px' }}>Supplier / Vendor</th>
                  <th style={{ width: '150px' }}>No. Surat Jalan</th>
                  <th style={{ width: '120px' }}>Penerima</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasuk.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Tidak ada transaksi masuk pada rentang waktu ini.</td>
                  </tr>
                ) : (
                  filteredMasuk.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>{item.noDokumen}</td>
                      <td>{item.tanggal}</td>
                      <td>
                        {item.items && item.items.length > 0 ? (
                          item.items.map((it, i) => (
                            <div key={i} style={{ fontSize: '13px' }}>
                              <strong>{it.namaBarang}</strong> ({it.idBarang}): <span style={{ color: '#047857', fontWeight: 700 }}>+{it.jumlah} {it.satuan}</span>
                            </div>
                          ))
                        ) : (
                          <div>
                            <strong>{item.namaBarang}</strong>: +{item.jumlah} {item.satuan}
                          </div>
                        )}
                      </td>
                      <td>{item.supplier}</td>
                      <td style={{ fontFamily: 'monospace' }}>{item.noSuratJalan}</td>
                      <td>{item.petugas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. LAPORAN BARANG KELUAR TABLE (MULTI-ITEM & RECIPIENT AWARE) */}
        {reportType === 'barang_keluar' && (
          <div className="table-container">
            <table className="barang-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th style={{ width: '150px' }}>No. Dokumen</th>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th>Rincian Barang Dikeluarkan</th>
                  <th style={{ width: '160px' }}>Tujuan / Divisi</th>
                  <th style={{ width: '160px' }}>Nama Penerima</th>
                  <th style={{ width: '120px' }}>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeluar.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Tidak ada transaksi keluar pada rentang waktu ini.</td>
                  </tr>
                ) : (
                  filteredKeluar.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#b91c1c' }}>{item.noDokumen}</td>
                      <td>{item.tanggal}</td>
                      <td>
                        {item.items && item.items.length > 0 ? (
                          item.items.map((it, i) => (
                            <div key={i} style={{ fontSize: '13px' }}>
                              <strong>{it.namaBarang}</strong> ({it.idBarang}): <span style={{ color: '#b91c1c', fontWeight: 700 }}>-{it.jumlah} {it.satuan}</span>
                            </div>
                          ))
                        ) : (
                          <div>
                            <strong>{item.namaBarang}</strong>: -{item.jumlah} {item.satuan}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.tujuan}</td>
                      <td style={{ fontWeight: 700, color: '#1e40af' }}>{item.namaPenerima}</td>
                      <td>{item.petugas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. LAPORAN MUTASI & PERGERAKAN STOK TABLE */}
        {reportType === 'mutasi' && (
          <div className="table-container">
            <table className="barang-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th style={{ width: '120px' }}>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th style={{ width: '150px' }}>Kategori</th>
                  <th style={{ width: '120px', color: '#15803d' }}>Total Masuk</th>
                  <th style={{ width: '120px', color: '#b91c1c' }}>Total Keluar</th>
                  <th style={{ width: '130px' }}>Sisa Stok Akhir</th>
                  <th style={{ width: '90px' }}>Satuan</th>
                </tr>
              </thead>
              <tbody>
                {mutasiData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Tidak ada data mutasi.</td>
                  </tr>
                ) : (
                  mutasiData.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.idBarang}</td>
                      <td style={{ fontWeight: 600 }}>{item.namaBarang}</td>
                      <td>{item.kategori}</td>
                      <td style={{ fontWeight: 700, color: '#15803d' }}>+{item.totalMasuk}</td>
                      <td style={{ fontWeight: 700, color: '#b91c1c' }}>-{item.totalKeluar}</td>
                      <td style={{ fontWeight: 800, fontSize: '15px' }}>{item.stok}</td>
                      <td>{item.satuan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TANDA TANGAN FORMAL DENGAN NAMA KEPALA BAGIAN YANG DAPAT DIRUBAH */}
        <div className="report-signatures">
          <div className="sig-box">
            <div>Dibuat Oleh:</div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Petugas Pengelola Gudang</div>
            <div className="sig-line">{session.nama || 'Dimas Frandika'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Staff Operasional</div>
          </div>

          <div className="sig-box">
            <div>Mengetahui & Menyetujui:</div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Kepala Bagian / Supervisor Gudang</div>
            <div className="sig-line">{namaKepalaBagian}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {nipKepalaBagian}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
