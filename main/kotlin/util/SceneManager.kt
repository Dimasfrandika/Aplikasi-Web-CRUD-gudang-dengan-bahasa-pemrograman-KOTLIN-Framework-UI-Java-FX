package util

import javafx.fxml.FXMLLoader
import javafx.scene.Scene
import javafx.stage.Stage

object SceneManager {

    private lateinit var stage: Stage

    fun setStage(primaryStage: Stage) {
        stage = primaryStage
    }

    fun switchScene(fxmlPath: String) {
        val location = SceneManager::class.java.getResource(fxmlPath)
            ?: throw IllegalArgumentException("FXML tidak ditemukan: $fxmlPath")

        val loader = FXMLLoader(location)
        val scene = Scene(loader.load())

        stage.scene = scene
        stage.show()
    }
}
