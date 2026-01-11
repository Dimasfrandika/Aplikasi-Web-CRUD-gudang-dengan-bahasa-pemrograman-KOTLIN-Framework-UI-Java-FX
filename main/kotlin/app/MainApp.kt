package app

import javafx.application.Application
import javafx.stage.Stage
import util.SceneManager

class MainApp : Application() {

    override fun start(stage: Stage) {
        stage.title = "Gudang App"

        SceneManager.setStage(stage)
        SceneManager.switchScene("/view/login.fxml")
    }
}

fun main() {
    Application.launch(MainApp::class.java)
}
