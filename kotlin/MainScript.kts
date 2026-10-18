#!/usr/bin/env kotlin
/**
 * Script Kotlin: Manajemen Inventaris dan Transaksi Gudang
 * Digunakan sebagai referensi logika backend berbasis Kotlin Script (.kts)
 */

data class ItemBarang(val idBarang: String, val nama: String, val stok: Int, val satuan: String)

val katalogBarang = mutableListOf(
    ItemBarang("BRG001", "Laptop ASUS VivoBook 15", 25, "Unit"),
    ItemBarang("BRG002", "Mouse Wireless Logitech M331", 120, "Pcs"),
    ItemBarang("BRG003", "Keyboard Mechanical Keychron K2", 8, "Unit"),
    ItemBarang("BRG004", "Monitor LG 24 Inch IPS 75Hz", 30, "Unit"),
    ItemBarang("BRG005", "Kabel HDMI 2.0 1.5 Meter", 200, "Pcs")
)

println("=== SISTEM MANAJEMEN GUDANG (KOTLIN SCRIPT) ===")
println("Total Barang Terdaftar: ${katalogBarang.size}")
katalogBarang.forEachIndexed { index, b ->
    println("${index + 1}. [${b.idBarang}] ${b.nama} - Stok: ${b.stok} ${b.satuan}")
}
