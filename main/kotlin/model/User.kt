package model

data class User(
    val id: Int,
    val email: String,
    val passwordHash: String
)