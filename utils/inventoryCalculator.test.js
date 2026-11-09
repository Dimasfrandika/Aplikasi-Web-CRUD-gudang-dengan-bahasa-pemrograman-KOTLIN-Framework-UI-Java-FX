// File: utils/inventoryCalculator.test.js
const {
  hitungTotalNilaiStok,
  evaluasiStatusStok,
  hitungSisaStokTransaksi,
  generateKodeTransaksi,
  apakahRoleMemilikiAkses,
  formatRupiah
} = require('./inventoryCalculator');

describe('Pengujian Logika Kalkulasi & Manajemen Inventaris Gudang', () => {
  describe('1. hitungTotalNilaiStok', () => {
    it('harus menghitung total nilai aset barang dengan benar', () => {
      const items = [
        { stok: 10, harga: 15000 },
        { stok: 5, harga: 20000 }
      ];
      // (10 * 15000) + (5 * 20000) = 150000 + 100000 = 250000
      expect(hitungTotalNilaiStok(items)).toBe(250000);
    });

    it('harus mengembalikan 0 jika array kosong atau bukan array', () => {
      expect(hitungTotalNilaiStok([])).toBe(0);
      expect(hitungTotalNilaiStok(null)).toBe(0);
      expect(hitungTotalNilaiStok(undefined)).toBe(0);
    });

    it('harus mengabaikan nilai stok atau harga negatif/invalid', () => {
      const items = [
        { stok: -5, harga: 10000 },
        { stok: 10, harga: -2000 },
        { stok: 'invalid', harga: 5000 },
        { stok: 4, harga: 2500 }
      ];
      expect(hitungTotalNilaiStok(items)).toBe(10000);
    });
  });

  describe('2. evaluasiStatusStok', () => {
    it('harus mengembalikan Habis jika stok 0 atau kurang', () => {
      expect(evaluasiStatusStok(0, 5)).toBe('Habis');
      expect(evaluasiStatusStok(-3, 5)).toBe('Habis');
      expect(evaluasiStatusStok(null, 5)).toBe('Habis');
    });

    it('harus mengembalikan Menipis jika stok berada di bawah atau sama dengan ambang batas minimum', () => {
      expect(evaluasiStatusStok(3, 5)).toBe('Menipis');
      expect(evaluasiStatusStok(5, 5)).toBe('Menipis');
    });

    it('harus mengembalikan Aman jika stok di atas ambang batas', () => {
      expect(evaluasiStatusStok(15, 5)).toBe('Aman');
      expect(evaluasiStatusStok(6, 5)).toBe('Aman');
    });

    it('harus menggunakan default threshold 5 jika tidak disediakan atau invalid', () => {
      expect(evaluasiStatusStok(3)).toBe('Menipis');
      expect(evaluasiStatusStok(3, -1)).toBe('Menipis');
      expect(evaluasiStatusStok(10, 'invalid')).toBe('Aman');
    });
  });

  describe('3. hitungSisaStokTransaksi', () => {
    it('harus menolak transaksi jika jumlah <= 0', () => {
      const res1 = hitungSisaStokTransaksi(10, 'masuk', 0);
      expect(res1.berhasil).toBe(false);
      expect(res1.sisaStok).toBe(10);
      expect(res1.pesan).toContain('harus lebih besar dari 0');

      const res2 = hitungSisaStokTransaksi(10, 'masuk', -2);
      expect(res2.berhasil).toBe(false);
    });

    it('harus menambah stok jika jenis transaksi masuk', () => {
      const res = hitungSisaStokTransaksi(15, 'masuk', 10);
      expect(res.berhasil).toBe(true);
      expect(res.sisaStok).toBe(25);
      expect(res.pesan).toBe('Penambahan stok berhasil');
    });

    it('harus mengurangi stok jika jenis transaksi keluar dan stok mencukupi', () => {
      const res = hitungSisaStokTransaksi(20, 'keluar', 7);
      expect(res.berhasil).toBe(true);
      expect(res.sisaStok).toBe(13);
      expect(res.pesan).toBe('Pengurangan stok berhasil');
    });

    it('harus menolak transaksi keluar jika stok tidak mencukupi', () => {
      const res = hitungSisaStokTransaksi(5, 'keluar', 10);
      expect(res.berhasil).toBe(false);
      expect(res.sisaStok).toBe(5);
      expect(res.pesan).toContain('Stok tidak mencukupi');
    });

    it('harus menolak jenis transaksi yang tidak dikenal', () => {
      const res = hitungSisaStokTransaksi(10, 'transfer', 5);
      expect(res.berhasil).toBe(false);
      expect(res.pesan).toContain('tidak valid');
    });

    it('harus menangani stok awal invalid atau negatif dengan fallback 0', () => {
      const res = hitungSisaStokTransaksi(-5, 'masuk', 10);
      expect(res.berhasil).toBe(true);
      expect(res.sisaStok).toBe(10);
    });
  });

  describe('4. generateKodeTransaksi', () => {
    it('harus membuat kode transaksi masuk berformat TRX-IN-YYYYMMDD-XXXX', () => {
      const refDate = new Date('2026-11-08T00:00:00Z');
      const kode = generateKodeTransaksi('masuk', 1, refDate);
      expect(kode).toMatch(/^TRX-IN-\d{8}-0001$/);
    });

    it('harus membuat kode transaksi keluar berformat TRX-OUT-YYYYMMDD-XXXX', () => {
      const refDate = new Date('2026-11-08T00:00:00Z');
      const kode = generateKodeTransaksi('keluar', 42, refDate);
      expect(kode).toMatch(/^TRX-OUT-\d{8}-0042$/);
    });

    it('harus menggunakan urutan minimal 1 jika index 0 atau negatif', () => {
      const kode = generateKodeTransaksi('masuk', 0);
      expect(kode).toContain('-0001');
    });
  });

  describe('5. apakahRoleMemilikiAkses', () => {
    it('admin harus memiliki semua hak akses', () => {
      expect(apakahRoleMemilikiAkses('admin', 'hapus_barang')).toBe(true);
      expect(apakahRoleMemilikiAkses('admin', 'edit_barang')).toBe(true);
      expect(apakahRoleMemilikiAkses('admin', 'pengaturan')).toBe(true);
    });

    it('petugas hanya boleh transaksi masuk, keluar, dan lihat stok', () => {
      expect(apakahRoleMemilikiAkses('petugas', 'transaksi_masuk')).toBe(true);
      expect(apakahRoleMemilikiAkses('petugas', 'transaksi_keluar')).toBe(true);
      expect(apakahRoleMemilikiAkses('petugas', 'lihat_stok')).toBe(true);
      expect(apakahRoleMemilikiAkses('petugas', 'hapus_barang')).toBe(false);
      expect(apakahRoleMemilikiAkses('petugas', 'pengaturan')).toBe(false);
    });

    it('role tidak dikenal harus ditolak aksesnya', () => {
      expect(apakahRoleMemilikiAkses('tamu', 'lihat_stok')).toBe(false);
      expect(apakahRoleMemilikiAkses(null, 'transaksi_masuk')).toBe(false);
    });
  });

  describe('6. formatRupiah', () => {
    it('harus memformat angka menjadi format Rupiah dengan benar', () => {
      expect(formatRupiah(1000000)).toMatch(/Rp\s*1\.000\.000/);
      expect(formatRupiah(50000)).toMatch(/Rp\s*50\.000/);
    });

    it('harus mengembalikan Rp 0 untuk input 0 atau invalid', () => {
      expect(formatRupiah(0)).toMatch(/Rp\s*0/);
      expect(formatRupiah('invalid')).toMatch(/Rp\s*0/);
      expect(formatRupiah(NaN)).toMatch(/Rp\s*0/);
    });
  });
});
