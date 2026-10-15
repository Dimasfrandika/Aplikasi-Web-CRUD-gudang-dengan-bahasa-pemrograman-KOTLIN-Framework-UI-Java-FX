export type UserRole = 'admin' | 'petugas';

export interface User {
  id: number;
  nama: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UserSession {
  userId: number | null;
  nama: string | null;
  email: string | null;
  role: UserRole | null;
}

export interface Barang {
  id: number;
  idBarang: string;
  namaBarang: string;
  kategori: string;
  stok: number;
  minStok: number;
  satuan: string;
  status: 'aktif' | 'nonaktif';
  keterangan?: string;
}

export interface TransaksiItem {
  barangId: number;
  idBarang: string;
  namaBarang: string;
  jumlah: number;
  satuan: string;
  keterangan?: string;
}

export interface TransaksiBarangMasuk {
  id: number;
  noDokumen: string;
  items: TransaksiItem[];
  tanggal: string;
  supplier: string;
  noSuratJalan: string;
  petugas: string;
  catatan?: string;
  // Backward compatibility fields
  barangId?: number;
  idBarang?: string;
  namaBarang?: string;
  jumlah?: number;
  satuan?: string;
}

export interface TransaksiBarangKeluar {
  id: number;
  noDokumen: string;
  items: TransaksiItem[];
  tanggal: string;
  tujuan: string;
  namaPenerima: string;
  keterangan: string;
  petugas: string;
  kepalaBagian?: string;
  // Backward compatibility fields
  barangId?: number;
  idBarang?: string;
  namaBarang?: string;
  jumlah?: number;
  satuan?: string;
}

export interface PengaturanGudang {
  namaKepalaBagian: string;
  nipKepalaBagian: string;
  namaPerusahaan: string;
  alamatGudang: string;
}

export type ReportType = 'sisa_stok' | 'barang_masuk' | 'barang_keluar' | 'mutasi';
