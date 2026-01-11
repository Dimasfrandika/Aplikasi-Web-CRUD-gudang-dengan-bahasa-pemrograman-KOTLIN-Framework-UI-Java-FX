package repository

import model.User
import util.DatabaseConfig

class UserRepository {

    fun findByEmail(email: String): User? {
        val sql = "SELECT * FROM users WHERE email = ?"

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, email)
                val rs = ps.executeQuery()

                if (rs.next()) {
                    return User(
                        rs.getInt("id"),
                        rs.getString("email"),
                        rs.getString("password_hash")
                    )
                }
            }
        }
        return null
    }

    fun save(email: String, passwordHash: String) {
        val sql = "INSERT INTO users(email, password_hash) VALUES (?, ?)"

        DatabaseConfig.getConnection().use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, email)
                ps.setString(2, passwordHash)
                ps.executeUpdate()
            }
        }
    }
}
