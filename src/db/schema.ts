import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (Role-Based Access: Admin / Petugas)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID (if Google Sign-In) or local ID
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('petugas'), // 'admin' | 'petugas'
  createdAt: timestamp('created_at').defaultNow(),
});

// Master Barang table
export const barang = pgTable('barang', {
  id: serial('id').primaryKey(),
  idBarang: text('id_barang').notNull().unique(), // Kode Barang (e.g. BRG001)
  namaBarang: text('nama_barang').notNull(),
  kategori: text('kategori').notNull().default('Umum'),
  stok: integer('stok').notNull().default(0),
  minStok: integer('min_stok').notNull().default(0),
  satuan: text('satuan').notNull().default('Unit'),
  status: text('status').notNull().default('aktif'), // 'aktif' | 'nonaktif'
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transaksi Barang Masuk (Inbound)
export const transaksiMasuk = pgTable('transaksi_masuk', {
  id: serial('id').primaryKey(),
  noDokumen: text('no_dokumen').notNull().unique(),
  tanggal: text('tanggal').notNull(),
  supplier: text('supplier').notNull(),
  noSuratJalan: text('no_surat_jalan').notNull(),
  petugas: text('petugas').notNull(),
  catatan: text('catatan'),
  items: jsonb('items').notNull(), // Array: [{ barangId, idBarang, namaBarang, jumlah, satuan, keterangan }]
  createdAt: timestamp('created_at').defaultNow(),
});

// Transaksi Barang Keluar (Outbound)
export const transaksiKeluar = pgTable('transaksi_keluar', {
  id: serial('id').primaryKey(),
  noDokumen: text('no_dokumen').notNull().unique(),
  tanggal: text('tanggal').notNull(),
  tujuan: text('tujuan').notNull(),
  namaPenerima: text('nama_penerima').notNull(),
  keterangan: text('keterangan'),
  petugas: text('petugas').notNull(),
  items: jsonb('items').notNull(), // Array: [{ barangId, idBarang, namaBarang, jumlah, satuan, keterangan }]
  createdAt: timestamp('created_at').defaultNow(),
});

// Pengaturan Gudang (Nama Perusahaan & Kepala Bagian Penandatangan)
export const pengaturanGudang = pgTable('pengaturan_gudang', {
  id: serial('id').primaryKey(),
  namaKepalaBagian: text('nama_kepala_bagian').notNull(),
  nipKepalaBagian: text('nip_kepala_bagian').notNull(),
  namaPerusahaan: text('nama_perusahaan').notNull(),
  alamatGudang: text('alamat_gudang').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
