package test

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.DisplayName
import util.StockValidator

/**
 * Unit Testing Validasi Stok di Kotlin menggunakan JUnit (Ekuivalen Jest utils/stok.test.js)
 * Di IntelliJ IDEA / Android Studio, Anda cukup klik ikon segitiga hijau (▶) di samping class atau function ini!
 */
@DisplayName("Pengujian Logika Validasi Stok (Kotlin)")
class StockValidatorTest {

    @Test
    @DisplayName("Harus bernilai true jika stok lebih besar atau sama dengan permintaan")
    fun testStokCukup() {
        val hasil = StockValidator.cekStokAman(stokSaatIni = 10, jumlahDiminta = 5)
        assertTrue(hasil, "Stok 10 harus cukup untuk permintaan 5")
    }

    @Test
    @DisplayName("Harus bernilai true jika stok tepat sama dengan permintaan")
    fun testStokTepatSama() {
        val hasil = StockValidator.cekStokAman(stokSaatIni = 10, jumlahDiminta = 10)
        assertTrue(hasil, "Stok 10 harus cukup untuk permintaan 10")
    }

    @Test
    @DisplayName("Harus bernilai false jika stok lebih kecil dari permintaan")
    fun testStokKurang() {
        val hasil = StockValidator.cekStokAman(stokSaatIni = 5, jumlahDiminta = 10)
        assertFalse(hasil, "Stok 5 tidak mencukupi untuk permintaan 10")
    }

    @Test
    @DisplayName("Harus bernilai false jika jumlah diminta adalah 0 atau minus")
    fun testPermintaanTidakValid() {
        assertFalse(StockValidator.cekStokAman(stokSaatIni = 10, jumlahDiminta = 0), "Permintaan 0 harus ditolak")
        assertFalse(StockValidator.cekStokAman(stokSaatIni = 10, jumlahDiminta = -3), "Permintaan minus harus ditolak")
    }
}
