import React from 'react';
import { TransaksiBarangKeluar } from '../types';
import { PengaturanService } from '../services/storage';
import { Printer, X, Truck } from 'lucide-react';

interface BuktiPengeluaranModalProps {
  isOpen: boolean;
  transaksi: TransaksiBarangKeluar | null;
  onClose: () => void;
}

export const BuktiPengeluaranModal: React.FC<BuktiPengeluaranModalProps> = ({
  isOpen,
  transaksi,
  onClose
}) => {
  if (!isOpen || !transaksi) {
    return null;
  }

  const pengaturan = PengaturanService.getPengaturan();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaksi.tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100, overflowY: 'auto', padding: '20px' }}>
      <div
        className="bukti-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          margin: 'auto',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Toolbar (hidden in print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(to right, #1e293b, #334155)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #475569'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={20} color="#60a5fa" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Bukti Pengeluaran Barang / Surat Jalan</h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Nomor Dokumen: <strong>{transaksi.noDokumen}</strong></p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={16} />
              Cetak / Simpan PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Tutup Bukti"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DOCUMENT */}
        <div
          id="printable-bukti-pengeluaran"
          style={{
            padding: '36px',
            backgroundColor: '#ffffff',
            color: '#0f172a'
          }}
        >
          {/* KOP RESMI DOKUMEN */}
          <div
            style={{
              borderBottom: '2.5px solid #1e3a8a',
              paddingBottom: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/images/gambar.png"
                alt="Logo"
                style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {pengaturan.namaPerusahaan}
                </h2>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Departemen Logistik & Tata Kelola Gudang
                </p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>
                  {pengaturan.alamatGudang} • Telp: (021) 8920-1122
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                border: '1.5px solid #1e3a8a',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e3a8a',
                display: 'inline-block'
              }}>
                SURAT JALAN / BUKTI PENGELUARAN
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Arsip Pengeluaran Gudang
              </div>
            </div>
          </div>

          {/* DOKUMEN TITLE */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', color: '#1e293b' }}>
              BUKTI PENGELUARAN BARANG GUDANG (OUTBOUND)
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              Nomor: <strong>{transaksi.noDokumen}</strong>
            </p>
          </div>

          {/* INFORMASI TRANSAKSI */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            background: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Tanggal Pengeluaran</span>
                : <strong>{formattedDate}</strong>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Tujuan / Divisi</span>
                : <strong>{transaksi.tujuan}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Keperluan / Catatan</span>
                : <span>{transaksi.keterangan || '-'}</span>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Nama Penerima</span>
                : <strong style={{ color: '#1e40af', fontSize: '14px' }}>{transaksi.namaPenerima}</strong>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Petugas Pengeluar</span>
                : <strong>{transaksi.petugas}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Status Verifikasi</span>
                : <span style={{ color: '#15803d', fontWeight: 700 }}>Disetujui & Stok Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* TABEL DAFTAR BARANG YANG DIKELUARKAN (MULTI-ITEM) */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Daftar Barang yang Diserahkan:
            </h4>
            <table className="barang-table" style={{ width: '100%', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ width: '40px', padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>No</th>
                  <th style={{ width: '130px', padding: '10px', border: '1px solid #cbd5e1' }}>Kode Barang</th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Nama Barang / Spesifikasi</th>
                  <th style={{ width: '110px', padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Jumlah</th>
                  <th style={{ width: '90px', padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Satuan</th>
                  <th style={{ width: '160px', padding: '10px', border: '1px solid #cbd5e1' }}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.items && transaksi.items.length > 0 ? (
                  transaksi.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', padding: '10px', border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, padding: '10px', border: '1px solid #cbd5e1' }}>{item.idBarang}</td>
                      <td style={{ fontWeight: 600, padding: '10px', border: '1px solid #cbd5e1' }}>{item.namaBarang}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', color: '#b91c1c', padding: '10px', border: '1px solid #cbd5e1' }}>
                        {item.jumlah}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px', border: '1px solid #cbd5e1' }}>{item.satuan}</td>
                      <td style={{ fontSize: '12px', color: '#475569', padding: '10px', border: '1px solid #cbd5e1' }}>
                        {item.keterangan || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', border: '1px solid #cbd5e1' }}>1</td>
                    <td style={{ fontWeight: 700, padding: '10px', border: '1px solid #cbd5e1' }}>{transaksi.idBarang}</td>
                    <td style={{ fontWeight: 600, padding: '10px', border: '1px solid #cbd5e1' }}>{transaksi.namaBarang}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', color: '#b91c1c', padding: '10px', border: '1px solid #cbd5e1' }}>
                      {transaksi.jumlah}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px', border: '1px solid #cbd5e1' }}>{transaksi.satuan}</td>
                    <td style={{ fontSize: '12px', color: '#475569', padding: '10px', border: '1px solid #cbd5e1' }}>
                      {transaksi.keterangan || '-'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PERNYATAAN SERAH TERIMA */}
          <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginBottom: '32px' }}>
            Barang-barang di atas telah diperiksa kondisi fisik dan jumlahnya secara seksama, serta diserahterimakan dalam keadaan baik dan lengkap.
          </p>

          {/* DUA KOLOM TANDA TANGAN: CUKUP PETUGAS GUDANG DAN PENERIMA BARANG SAJA */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            textAlign: 'center',
            fontSize: '13px'
          }}>
            {/* 1. Yang Menyerahkan */}
            <div>
              <div style={{ fontWeight: 600, color: '#475569' }}>Yang Menyerahkan:</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Petugas Pengeluar Gudang</div>
              <div style={{
                marginTop: '70px',
                borderTop: '1px solid #334155',
                paddingTop: '6px',
                fontWeight: 700,
                fontSize: '14px',
                color: '#0f172a'
              }}>
                {transaksi.petugas}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Staff Pengelola Gudang</div>
            </div>

            {/* 2. Yang Menerima */}
            <div>
              <div style={{ fontWeight: 600, color: '#475569' }}>Yang Menerima:</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Penerima Barang / Divisi</div>
              <div style={{
                marginTop: '70px',
                borderTop: '1px solid #334155',
                paddingTop: '6px',
                fontWeight: 700,
                fontSize: '14px',
                color: '#1e40af'
              }}>
                {transaksi.namaPenerima}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{transaksi.tujuan}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
