package model

data class User(
    var id: Int = 0,
    var nama: String,
    var email: String,
    var passwordHash: String,
    var role: String = "petugas" // "admin" | "petugas"
)
