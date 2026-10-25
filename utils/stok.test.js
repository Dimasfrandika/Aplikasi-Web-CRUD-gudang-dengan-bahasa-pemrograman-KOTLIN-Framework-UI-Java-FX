// File: utils/stok.test.js
const { cekStokAman } = require('./stok');

describe('Pengujian Logika Validasi Stok', () => {
  it('harus bernilai true jika stok lebih besar dari permintaan', () => {
    expect(cekStokAman(10, 5)).toBe(true);
  });

  it('harus bernilai false jika stok lebih kecil dari permintaan', () => {
    expect(cekStokAman(5, 10)).toBe(false);
  });

  it('harus bernilai false jika jumlah diminta adalah 0 atau minus', () => {
    expect(cekStokAman(10, 0)).toBe(false);
  });
});
