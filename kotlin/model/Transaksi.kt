package model

data class TransaksiItem(
    val barangId: Int,
    val idBarang: String,
    val namaBarang: String,
    val jumlah: Int,
    val satuan: String,
    val keterangan: String? = null
)

data class TransaksiMasuk(
    var id: Int = 0,
    var noDokumen: String,
    var tanggal: String,
    var supplier: String,
    var noSuratJalan: String,
    var petugas: String,
    var catatan: String? = null,
    var items: List<TransaksiItem> = listOf()
)

data class TransaksiKeluar(
    var id: Int = 0,
    var noDokumen: String,
    var tanggal: String,
    var tujuan: String,
    var namaPenerima: String,
    var keterangan: String? = null,
    var petugas: String,
    var items: List<TransaksiItem> = listOf()
)
