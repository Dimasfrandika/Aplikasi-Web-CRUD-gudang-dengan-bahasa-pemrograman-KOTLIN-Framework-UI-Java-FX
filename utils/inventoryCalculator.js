// File: utils/inventoryCalculator.js
/**
 * Sistem Manajemen Gudang - Modul Kalkulator & Logika Inventaris
 * Digunakan untuk pengujian unit test dan kalkulasi inventaris stok
 */

/**
 * Menghitung total nilai aset barang yang ada di gudang.
 * @param {Array<{ stok: number, harga: number }>} items
 * @returns {number}
 */
function hitungTotalNilaiStok(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((total, item) => {
    const stok = typeof item.stok === 'number' && item.stok > 0 ? item.stok : 0;
    const harga = typeof item.harga === 'number' && item.harga > 0 ? item.harga : 0;
    return total + (stok * harga);
  }, 0);
}

/**
 * Mengevaluasi status indikator ketersediaan stok barang.
 * @param {number} stok Saat ini
 * @param {number} stokMinimum Batas minimum aman
 * @returns {'Habis' | 'Menipis' | 'Aman'}
 */
function evaluasiStatusStok(stok, stokMinimum = 5) {
  const currentStok = typeof stok === 'number' ? stok : 0;
  const threshold = typeof stokMinimum === 'number' && stokMinimum >= 0 ? stokMinimum : 5;

  if (currentStok <= 0) {
    return 'Habis';
  }
  if (currentStok <= threshold) {
    return 'Menipis';
  }
  return 'Aman';
}

/**
 * Menghitung perubahan stok setelah transaksi masuk atau keluar.
 * @param {number} stokAwal Stok saat ini
 * @param {'masuk' | 'keluar'} jenis Jenis transaksi
 * @param {number} jumlah Jumlah transaksi
 * @returns {{ berhasil: boolean, sisaStok: number, pesan: string }}
 */
function hitungSisaStokTransaksi(stokAwal, jenis, jumlah) {
  const awal = typeof stokAwal === 'number' && stokAwal >= 0 ? stokAwal : 0;
  const qty = typeof jumlah === 'number' && jumlah > 0 ? jumlah : 0;

  if (qty <= 0) {
    return {
      berhasil: false,
      sisaStok: awal,
      pesan: 'Jumlah transaksi harus lebih besar dari 0'
    };
  }

  if (jenis === 'masuk') {
    return {
      berhasil: true,
      sisaStok: awal + qty,
      pesan: 'Penambahan stok berhasil'
    };
  }

  if (jenis === 'keluar') {
    if (awal < qty) {
      return {
        berhasil: false,
        sisaStok: awal,
        pesan: 'Stok tidak mencukupi untuk pengeluaran barang'
      };
    }
    return {
      berhasil: true,
      sisaStok: awal - qty,
      pesan: 'Pengurangan stok berhasil'
    };
  }

  return {
    berhasil: false,
    sisaStok: awal,
    pesan: 'Jenis transaksi tidak valid'
  };
}

/**
 * Membuat nomor kode unik transaksi terstandarisasi.
 * @param {'masuk' | 'keluar'} jenis
 * @param {number} nomorUrut
 * @param {Date} [tanggalRef]
 * @returns {string}
 */
function generateKodeTransaksi(jenis, nomorUrut, tanggalRef = new Date()) {
  const prefix = jenis === 'masuk' ? 'TRX-IN' : 'TRX-OUT';
  const year = tanggalRef.getFullYear();
  const month = String(tanggalRef.getMonth() + 1).padStart(2, '0');
  const day = String(tanggalRef.getDate()).padStart(2, '0');
  const sequence = String(Math.max(1, nomorUrut || 1)).padStart(4, '0');

  return `${prefix}-${year}${month}${day}-${sequence}`;
}

/**
 * Memvalidasi hak akses role pengguna (RBAC).
 * @param {'admin' | 'petugas' | string} role
 * @param {'hapus_barang' | 'edit_barang' | 'transaksi_masuk' | 'transaksi_keluar' | 'pengaturan'} fitur
 * @returns {boolean}
 */
function apakahRoleMemilikiAkses(role, fitur) {
  if (role === 'admin') {
    return true; // Admin memiliki seluruh akses
  }

  if (role === 'petugas') {
    // Petugas hanya diizinkan transaksi masuk, keluar, dan melihat stok
    const allowedForPetugas = ['transaksi_masuk', 'transaksi_keluar', 'lihat_stok'];
    return allowedForPetugas.includes(fitur);
  }

  return false;
}

/**
 * Memformat angka ke format mata uang Rupiah (IDR).
 * @param {number} nominal
 * @returns {string}
 */
function formatRupiah(nominal) {
  const value = typeof nominal === 'number' && !isNaN(nominal) ? nominal : 0;
  return 'Rp ' + Math.floor(value).toLocaleString('id-ID');
}

module.exports = {
  hitungTotalNilaiStok,
  evaluasiStatusStok,
  hitungSisaStokTransaksi,
  generateKodeTransaksi,
  apakahRoleMemilikiAkses,
  formatRupiah
};
