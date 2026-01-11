package controller

import javafx.fxml.FXML
import javafx.scene.control.Alert
import javafx.scene.control.PasswordField
import javafx.scene.control.TextField
import service.AuthService
import util.SceneManager
import javafx.scene.control.Button


class LoginController {

    @FXML
    private lateinit var emailField: TextField

    @FXML lateinit var passwordField: PasswordField
    @FXML lateinit var passwordTextField: TextField

    @FXML
    private lateinit var loginButton: Button


    private val authService = AuthService()

    @FXML
    fun handleLogin() {

        // 1. Disable tombol saat proses
        loginButton.isDisable = true

        val email = emailField.text.trim()
        val password = passwordField.text.trim()

        // 2. Validasi input
        if (email.isEmpty() || password.isEmpty()) {
            showAlert("Error", "Email dan password wajib diisi")
            loginButton.isDisable = false
            return
        }

        // 3. Proses login
        val success = authService.login(email, password)

        // 4. Hasil login
        if (success) {

            //(hindari UI blocking)
            SceneManager.switchScene("/view/barang.fxml")
        } else {
            showAlert("Gagal", "Email atau password salah")
            loginButton.isDisable = false
        }
    }

    @FXML
    fun handleTogglePassword() {
        if (passwordField.isVisible) {
            passwordTextField.text = passwordField.text
            passwordField.isVisible = false
            passwordField.isManaged = false

            passwordTextField.isVisible = true
            passwordTextField.isManaged = true
        } else {
            passwordField.text = passwordTextField.text
            passwordTextField.isVisible = false
            passwordTextField.isManaged = false

            passwordField.isVisible = true
            passwordField.isManaged = true
        }
    }



    @FXML
    fun handleRegister() {
        SceneManager.switchScene("/view/register.fxml")
    }

    private fun showAlert(title: String, message: String) {
        val alert = Alert(Alert.AlertType.INFORMATION)
        alert.title = title
        alert.headerText = null
        alert.contentText = message
        alert.showAndWait()
    }
}
