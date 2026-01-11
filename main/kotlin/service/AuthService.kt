package service

import repository.UserRepository
import org.mindrot.jbcrypt.BCrypt
import util.UserSession

class AuthService {

    private val userRepo = UserRepository()

    fun register(email: String, password: String): Boolean {
        return try {
            if (userRepo.findByEmail(email) != null) {
                false
            } else {
                val hash = BCrypt.hashpw(password, BCrypt.gensalt())
                userRepo.save(email, hash)
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun login(email: String, password: String): Boolean {
        return try {
            val user = userRepo.findByEmail(email) ?: return false

            if (BCrypt.checkpw(password, user.passwordHash)) {
                // SIMPAN SESSION
                UserSession.userId = user.id
                UserSession.email = user.email
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
