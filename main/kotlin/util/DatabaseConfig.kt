package util

import java.sql.Connection
import java.sql.DriverManager

object DatabaseConfig {

    private const val URL =
        "jdbc:postgresql://localhost:5432/gudang_app"

    private const val USER = "postgres"
    private const val PASSWORD = "Dimas87frandika"

    fun getConnection(): Connection {
        return DriverManager.getConnection(
            URL, USER, PASSWORD
        )
    }
}
