// File: utils/stok.js
function cekStokAman(stokSaatIni, jumlahDiminta) {
  if (jumlahDiminta <= 0) return false;
  return stokSaatIni >= jumlahDiminta;
}

module.exports = { cekStokAman };
