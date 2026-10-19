-- ====================================================================
-- DATABASE SCHEMA POSTGRESQL UNTUK APLIKASI: gudang_app
-- Host: localhost (atau IP server Anda)
-- Port: 5432
-- Database: gudang_app
-- User: postgres
-- Password: Dimas87frandika
-- ====================================================================

-- 1. Buat database jika belum ada (jalankan di template/postgres database)
-- CREATE DATABASE gudang_app;

-- Sambungkan ke database gudang_app sebelum mengeksekusi tabel berikut:
-- \c gudang_app;

-- 2. Hapus tabel lama jika ingin memulai dari kondisi bersih
DROP TABLE IF EXISTS transaksi_keluar CASCADE;
DROP TABLE IF EXISTS transaksi_masuk CASCADE;
DROP TABLE IF EXISTS barang CASCADE;
DROP TABLE IF EXISTS pengaturan_gudang CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Tabel Users (Autentikasi & Hak Akses: Admin / Petugas)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid TEXT UNIQUE,
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'petugas', -- 'admin' | 'petugas'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Master Barang (Katalog Stok & Limit Minimum)
CREATE TABLE barang (
    id SERIAL PRIMARY KEY,
    id_barang TEXT NOT NULL UNIQUE, -- Kode Barang unik (contoh: BRG001)
    nama_barang TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'Umum',
    stok INTEGER NOT NULL DEFAULT 0,
    min_stok INTEGER NOT NULL DEFAULT 0,
    satuan TEXT NOT NULL DEFAULT 'Unit',
    status TEXT NOT NULL DEFAULT 'aktif', -- 'aktif' | 'nonaktif'
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Transaksi Barang Masuk (Inbound Multi-Item)
CREATE TABLE transaksi_masuk (
    id SERIAL PRIMARY KEY,
    no_dokumen TEXT NOT NULL UNIQUE,
    tanggal TEXT NOT NULL, -- Format: YYYY-MM-DD
    supplier TEXT NOT NULL,
    no_surat_jalan TEXT NOT NULL,
    petugas TEXT NOT NULL,
    catatan TEXT,
    items JSONB NOT NULL, -- Array: [{"barangId": 1, "idBarang": "BRG001", "namaBarang": "...", "jumlah": 10, "satuan": "Unit", "keterangan": "..."}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Transaksi Barang Keluar (Outbound Multi-Item & Surat Jalan)
CREATE TABLE transaksi_keluar (
    id SERIAL PRIMARY KEY,
    no_dokumen TEXT NOT NULL UNIQUE,
    tanggal TEXT NOT NULL, -- Format: YYYY-MM-DD
    tujuan TEXT NOT NULL,
    nama_penerima TEXT NOT NULL,
    keterangan TEXT,
    petugas TEXT NOT NULL,
    items JSONB NOT NULL, -- Array: [{"barangId": 1, "idBarang": "BRG001", "namaBarang": "...", "jumlah": 5, "satuan": "Unit", "keterangan": "..."}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Pengaturan Gudang (Profil Instansi & Kepala Bagian Penandatangan Laporan)
CREATE TABLE pengaturan_gudang (
    id SERIAL PRIMARY KEY,
    nama_kepala_bagian TEXT NOT NULL,
    nip_kepala_bagian TEXT NOT NULL,
    nama_perusahaan TEXT NOT NULL,
    alamat_gudang TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Indeks Pencarian Cepat
CREATE INDEX idx_barang_kode ON barang(id_barang);
CREATE INDEX idx_barang_kategori ON barang(kategori);
CREATE INDEX idx_transaksi_masuk_tgl ON transaksi_masuk(tanggal);
CREATE INDEX idx_transaksi_keluar_tgl ON transaksi_keluar(tanggal);

-- 9. Inisialisasi Akun Admin Utama
INSERT INTO users (nama, email, password_hash, role)
VALUES 
    ('Dimas Frandika', 'dimasfrandika87@gmail.com', 'Dimas87frandika', 'admin'),
    ('Administrator Gudang', 'admin@gudang.com', 'admin', 'admin');

-- 10. Inisialisasi Pengaturan Gudang Awal
INSERT INTO pengaturan_gudang (nama_kepala_bagian, nip_kepala_bagian, nama_perusahaan, alamat_gudang)
VALUES (
    'Hendrawan Pratama, S.T., M.M.',
    '19840315 200812 1 002',
    'PT Global Logistik Nusantara',
    'Kawasan Industri Pergudangan Terpadu Blok C-12'
);

-- SELESAI: Database gudang_app telah siap dengan 0 barang dan 0 transaksi (bersih siap input baru).
