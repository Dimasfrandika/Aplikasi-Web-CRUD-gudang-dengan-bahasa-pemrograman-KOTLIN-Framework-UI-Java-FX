package model

data class Barang(
    var id: Int = 0,
    var idBarang: String,
    var namaBarang: String,
    var kategori: String = "Umum",
    var stok: Int = 0,
    var minStok: Int = 0,
    var satuan: String = "Unit",
    var status: String = "aktif",
    var keterangan: String? = null
)
