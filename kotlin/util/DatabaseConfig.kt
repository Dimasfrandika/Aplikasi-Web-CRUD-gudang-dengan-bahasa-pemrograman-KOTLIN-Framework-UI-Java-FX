package util

import java.sql.Connection
import java.sql.DriverManager
import java.sql.SQLException

object DatabaseConfig {
    private const val DB_HOST = "localhost"
    private const val DB_PORT = "5432"
    private const val DB_NAME = "gudang_db"
    private const val DB_USER = "postgres"
    private const val DB_PASSWORD = "password"

    private val URL = "jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"

    fun getConnection(): Connection {
        return try {
            Class.forName("org.postgresql.Driver")
            DriverManager.getConnection(URL, DB_USER, DB_PASSWORD)
        } catch (e: ClassNotFoundException) {
            throw SQLException("PostgreSQL JDBC Driver tidak ditemukan!", e)
        }
    }
}
