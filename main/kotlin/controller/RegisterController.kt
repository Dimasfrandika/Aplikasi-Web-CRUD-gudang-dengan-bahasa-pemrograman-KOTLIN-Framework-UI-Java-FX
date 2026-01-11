package controller

import javafx.fxml.FXML
import javafx.scene.control.Alert
import javafx.scene.control.PasswordField
import javafx.scene.control.TextField
import service.AuthService
import util.SceneManager
import javafx.scene.control.Button

class RegisterController {

    @FXML private lateinit var emailField: TextField
    @FXML lateinit var passwordField: PasswordField
    @FXML lateinit var passwordTextField: TextField
    @FXML lateinit var togglePassword: Button


    private val authService = AuthService()
    @FXML
    fun handleRegister() {
        val email = emailField.text.trim()
        val password = passwordField.text.trim()

        if (email.isEmpty() || password.isEmpty()) {
            showAlert("Error", "Email dan password wajib diisi")
            return
        }

        val success = authService.register(email, password)

        if (success) {
            showAlert("Sukses", "Registrasi berhasil, silakan login")
            SceneManager.switchScene("/view/login.fxml")
        } else {
            showAlert("Error", "Email sudah terdaftar")
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
    fun handleBackToLogin() {
        SceneManager.switchScene("/view/login.fxml")
    }

    private fun showAlert(title: String, message: String) {
        val alert = Alert(Alert.AlertType.INFORMATION)
        alert.title = title
        alert.headerText = null
        alert.contentText = message
        alert.showAndWait()
    }
}
