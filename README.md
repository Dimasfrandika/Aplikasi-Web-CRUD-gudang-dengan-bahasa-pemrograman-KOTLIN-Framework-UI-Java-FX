# Manajemen Data Gudang (Web CRUD)

Aplikasi Web Manajemen Data Gudang yang dimigrasikan dari aplikasi Kotlin JavaFX menjadi aplikasi web modern berbasis React SPA + TypeScript + Vite.

## Fitur Utama

1. **Autentikasi Pengguna**:
   - Registrasi Akun baru dengan validasi data dan email unik.
   - Login pengguna dengan toggle sembunyikan/tampilkan password.
   - Manajemen sesi pengguna (UserSession).
   - Akun Demo bawaan: `dimasfrandika87@gmail.com` (password: `password123`) atau `admin@gudang.com` (password: `admin`).

2. **CRUD Data Gudang (Barang)**:
   - **Tabel Data Barang**: Menampilkan Nomor, ID, Kode Barang, Nama Barang, Stok, dan Satuan.
   - **Seleksi Baris Interaktif**: Klik pada baris tabel untuk memuat data ke dalam formulir.
   - **Pencarian Real-time**: Filter instan berdasarkan nama atau kode barang.
   - **Tambah Barang**: Menambahkan data barang baru ke gudang.
   - **Ubah Barang**: Memperbarui data barang yang dipilih.
   - **Hapus Barang**: Menghapus data barang yang dipilih dari gudang.
   - **Logout**: Keluar dari akun dan kembali ke halaman login.

## Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Aplikasi berjalan di port 3000 (`http://0.0.0.0:3000`).
