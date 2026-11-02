Feature: Fitur Login Sistem Gudang

  Scenario: Petugas berhasil login dengan data yang benar
    Given Pengguna membuka halaman login aplikasi gudang
    When Pengguna mengetik email "petugas@gudang.com" dan password "rahasia123"
    And Pengguna menekan tombol "Masuk"
    Then Sistem harus mengarahkan pengguna ke halaman Dashboard
