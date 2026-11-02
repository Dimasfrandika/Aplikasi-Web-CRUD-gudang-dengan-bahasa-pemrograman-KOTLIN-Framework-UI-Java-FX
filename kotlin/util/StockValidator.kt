package util

/**
 * Validasi Stok Barang untuk Sistem Gudang (Kotlin)
 * Ekuivalen dengan fungsi cekStokAman pada Jest testing (utils/stok.js)
 */
object StockValidator {

    /**
     * Memvalidasi apakah stok yang diminta aman untuk dikeluarkan.
     * @param stokSaatIni Kuantitas fisik stok yang tersisa di gudang.
     * @param jumlahDiminta Kuantitas barang yang diminta/dikeluarkan.
     * @return true jika jumlahDiminta > 0 dan stokSaatIni >= jumlahDiminta, sebaliknya false.
     */
    fun cekStokAman(stokSaatIni: Int, jumlahDiminta: Int): Boolean {
        if (jumlahDiminta <= 0) return false
        return stokSaatIni >= jumlahDiminta
    }
}
