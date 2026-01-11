package controller

import javafx.fxml.FXML
import javafx.scene.control.*
import javafx.collections.FXCollections
import model.Barang
import repository.BarangRepository
import util.UserSession
import util.SceneManager

class BarangController {

    @FXML lateinit var colNo: TableColumn<Barang, Void>
    @FXML lateinit var tableBarang: TableView<Barang>
    @FXML lateinit var colId: TableColumn<Barang, Int>
    @FXML lateinit var colIdBarang: TableColumn<Barang, String>
    @FXML lateinit var colNama: TableColumn<Barang, String>
    @FXML lateinit var colStok: TableColumn<Barang, Int>
    @FXML lateinit var colSatuan: TableColumn<Barang, String>

    @FXML lateinit var txtIdBarang: TextField
    @FXML lateinit var txtNamaBarang: TextField
    @FXML lateinit var txtStok: TextField
    @FXML lateinit var txtSatuan: TextField
    @FXML lateinit var lblUser: Label


    private val repository = BarangRepository()

    @FXML
    fun initialize() {

        // VALIDASI SESSION
        if (!UserSession.isLoggedIn()) {
            SceneManager.switchScene("/view/login.fxml")
            return
        }

        lblUser.text = "Login sebagai: ${UserSession.email}"

        colNo.setCellFactory {
            object : TableCell<Barang, Void>() {
                override fun updateItem(item: Void?, empty: Boolean) {
                    super.updateItem(item, empty)
                    text = if (empty) null else (index + 1).toString()
                }
            }
        }

        colId.setCellValueFactory { it.value.idProperty.asObject() }
        colIdBarang.setCellValueFactory { it.value.idBarangProperty }
        colNama.setCellValueFactory { it.value.namaBarangProperty }
        colStok.setCellValueFactory { it.value.stokProperty.asObject() }
        colSatuan.setCellValueFactory { it.value.satuanProperty }

        loadData()

        tableBarang.selectionModel.selectedItemProperty().addListener { _, _, barang ->
            barang?.let {
                txtIdBarang.text = it.idBarang
                txtNamaBarang.text = it.namaBarang
                txtStok.text = it.stok.toString()
                txtSatuan.text = it.satuan
            }
        }
    }

    private fun loadData() {
        tableBarang.items = FXCollections.observableArrayList(repository.getAll())
    }

    @FXML
    fun handleTambah() {
        val barang = Barang(0,
            txtIdBarang.text,
            txtNamaBarang.text,
            txtStok.text.toInt(),
            txtSatuan.text
        )
        repository.insert(barang)
        loadData()
        clearForm()
    }

    @FXML
    fun handleUbah() {
        val selected = tableBarang.selectionModel.selectedItem ?: return
        val barang = Barang(selected.id,
            txtIdBarang.text,
            txtNamaBarang.text,
            txtStok.text.toInt(),
            txtSatuan.text
        )
        repository.update(barang)
        loadData()
    }

    @FXML
    fun handleHapus() {
        val selected = tableBarang.selectionModel.selectedItem ?: return
        repository.delete(selected.id)
        loadData()
        clearForm()
    }

    @FXML
    fun handleLogout() {
        UserSession.clear()
        SceneManager.switchScene("/view/login.fxml")
    }

    private fun clearForm() {
        txtIdBarang.clear()
        txtNamaBarang.clear()
        txtStok.clear()
        txtSatuan.clear()
    }
}
