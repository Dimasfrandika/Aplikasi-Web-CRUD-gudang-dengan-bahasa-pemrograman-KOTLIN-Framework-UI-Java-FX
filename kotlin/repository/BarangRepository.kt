package repository

import model.Barang
import util.DatabaseConfig
import java.sql.SQLException

class BarangRepository {

    fun getAll(): List<Barang> {
        val list = mutableListOf<Barang>()
        val sql = "SELECT * FROM barang ORDER BY id ASC"
        try {
            DatabaseConfig.getConnection().use { conn ->
                conn.createStatement().use { stmt ->
                    val rs = stmt.executeQuery(sql)
                    while (rs.next()) {
                        list.add(
                            Barang(
                                id = rs.getInt("id"),
                                idBarang = rs.getString("id_barang"),
                                namaBarang = rs.getString("nama_barang"),
                                kategori = rs.getString("kategori"),
                                stok = rs.getInt("stok"),
                                minStok = rs.getInt("min_stok"),
                                satuan = rs.getString("satuan"),
                                status = rs.getString("status"),
                                keterangan = rs.getString("keterangan")
                            )
                        )
                    }
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
        }
        return list
    }

    fun insert(barang: Barang): Boolean {
        val sql = """
            INSERT INTO barang (id_barang, nama_barang, kategori, stok, min_stok, satuan, status, keterangan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """.trimIndent()
        return try {
            DatabaseConfig.getConnection().use { conn ->
                conn.prepareStatement(sql).use { pstmt ->
                    pstmt.setString(1, barang.idBarang.uppercase())
                    pstmt.setString(2, barang.namaBarang)
                    pstmt.setString(3, barang.kategori)
                    pstmt.setInt(4, barang.stok)
                    pstmt.setInt(5, barang.minStok)
                    pstmt.setString(6, barang.satuan)
                    pstmt.setString(7, barang.status)
                    pstmt.setString(8, barang.keterangan ?: "")
                    pstmt.executeUpdate() > 0
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            false
        }
    }

    fun update(barang: Barang): Boolean {
        val sql = """
            UPDATE barang 
            SET id_barang = ?, nama_barang = ?, kategori = ?, stok = ?, min_stok = ?, satuan = ?, status = ?, keterangan = ? 
            WHERE id = ?
        """.trimIndent()
        return try {
            DatabaseConfig.getConnection().use { conn ->
                conn.prepareStatement(sql).use { pstmt ->
                    pstmt.setString(1, barang.idBarang.uppercase())
                    pstmt.setString(2, barang.namaBarang)
                    pstmt.setString(3, barang.kategori)
                    pstmt.setInt(4, barang.stok)
                    pstmt.setInt(5, barang.minStok)
                    pstmt.setString(6, barang.satuan)
                    pstmt.setString(7, barang.status)
                    pstmt.setString(8, barang.keterangan ?: "")
                    pstmt.setInt(9, barang.id)
                    pstmt.executeUpdate() > 0
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            false
        }
    }

    fun delete(id: Int): Boolean {
        val sql = "DELETE FROM barang WHERE id = ?"
        return try {
            DatabaseConfig.getConnection().use { conn ->
                conn.prepareStatement(sql).use { pstmt ->
                    pstmt.setInt(1, id)
                    pstmt.executeUpdate() > 0
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            false
        }
    }
}
