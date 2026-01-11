import util.DatabaseConfig

fun main() {
    try {
        DatabaseConfig.getConnection().use {
            println("KONEKSI KE POSTGRESQL BERHASIL")
        }
    } catch (e: Exception) {
        println("KONEKSI GAGAL")
        e.printStackTrace()
    }
}
