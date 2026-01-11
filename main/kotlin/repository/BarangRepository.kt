package repository

import model.Barang
import util.DatabaseConfig

class BarangRepository {

    fun getAll(): List<Barang> {
        val list = mutableListOf<Barang>()
        val sql = "SELECT * FROM barang ORDER BY id"

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                val rs = ps.executeQuery()
                while (rs.next()) {
                    list.add(
                        Barang(
                            id = rs.getInt("id"),
                            idBarang = rs.getString("id_barang"),
                            namaBarang = rs.getString("nama_barang"),
                            stok = rs.getInt("stok"),
                            satuan = rs.getString("satuan")
                        )
                    )
                }
            }
        }
        return list
    }

    fun insert(barang: Barang) {
        val sql = """
            INSERT INTO barang (id_barang, nama_barang, stok, satuan)
            VALUES (?, ?, ?, ?)
        """.trimIndent()

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, barang.idBarang)
                ps.setString(2, barang.namaBarang)
                ps.setInt(3, barang.stok)
                ps.setString(4, barang.satuan)
                ps.executeUpdate()
            }
        }
    }

    fun update(barang: Barang) {
        val sql = """
            UPDATE barang
            SET id_barang = ?, nama_barang = ?, stok = ?, satuan = ?
            WHERE id = ?
        """.trimIndent()

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, barang.idBarang)
                ps.setString(2, barang.namaBarang)
                ps.setInt(3, barang.stok)
                ps.setString(4, barang.satuan)
                ps.setInt(5, barang.id)
                ps.executeUpdate()
            }
        }
    }

    fun delete(id: Int) {
        val sql = "DELETE FROM barang WHERE id = ?"

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setInt(1, id)
                ps.executeUpdate()
            }
        }
    }
}
