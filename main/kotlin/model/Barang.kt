package model

import javafx.beans.property.*

class Barang(
    id: Int,
    idBarang: String,
    namaBarang: String,
    stok: Int,
    satuan: String
) {
    val idProperty = SimpleIntegerProperty(id)
    val idBarangProperty = SimpleStringProperty(idBarang)
    val namaBarangProperty = SimpleStringProperty(namaBarang)
    val stokProperty = SimpleIntegerProperty(stok)
    val satuanProperty = SimpleStringProperty(satuan)

    val id get() = idProperty.get()
    val idBarang get() = idBarangProperty.get()
    val namaBarang get() = namaBarangProperty.get()
    val stok get() = stokProperty.get()
    val satuan get() = satuanProperty.get()
}
