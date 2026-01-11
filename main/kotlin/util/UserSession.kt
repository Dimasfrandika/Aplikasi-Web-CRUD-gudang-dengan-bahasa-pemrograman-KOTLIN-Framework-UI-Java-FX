package util

object UserSession {
    var userId: Int? = null
    var email: String? = null

    fun isLoggedIn(): Boolean {
        return userId != null
    }

    fun clear() {
        userId = null
        email = null
    }
}
