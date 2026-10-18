import {
  Barang,
  User,
  UserSession,
  TransaksiBarangMasuk,
  TransaksiBarangKeluar,
  PengaturanGudang
} from '../types';

const STORAGE_KEY_BARANG = 'gudang_barang_list_v3';
const STORAGE_KEY_USERS = 'gudang_users_list_v3';
const STORAGE_KEY_SESSION = 'gudang_user_session_v3';
const STORAGE_KEY_MASUK = 'gudang_transaksi_masuk_v3';
const STORAGE_KEY_KELUAR = 'gudang_transaksi_keluar_v3';
const STORAGE_KEY_PENGATURAN = 'gudang_pengaturan_v3';

export async function syncAllFromBackend(): Promise<void> {
  try {
    const [barangRes, masukRes, keluarRes, pengaturanRes, usersRes] = await Promise.all([
      fetch('/api/barang'),
      fetch('/api/transaksi-masuk'),
      fetch('/api/transaksi-keluar'),
      fetch('/api/pengaturan'),
      fetch('/api/users')
    ]);

    if (barangRes.ok) {
      const data = await barangRes.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(data));
      }
    }

    if (masukRes.ok) {
      const data = await masukRes.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_MASUK, JSON.stringify(data));
      }
    }

    if (keluarRes.ok) {
      const data = await keluarRes.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_KELUAR, JSON.stringify(data));
      }
    }

    if (pengaturanRes.ok) {
      const data = await pengaturanRes.json();
      if (data && (data.namaKepalaBagian || data.namaPerusahaan)) {
        localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(data));
      }
    }

    if (usersRes.ok) {
      const data = await usersRes.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data));
      }
    }
  } catch (error) {
    console.warn('Backend sync failed, using cached data:', error);
  }
}

const INITIAL_BARANG: Barang[] = [
  { id: 1, idBarang: 'BRG001', namaBarang: 'Laptop ASUS VivoBook 15', kategori: 'Elektronik', stok: 25, minStok: 5, satuan: 'Unit', status: 'aktif', keterangan: 'Core i5 / 8GB / 512GB SSD' },
  { id: 2, idBarang: 'BRG002', namaBarang: 'Mouse Wireless Logitech M331', kategori: 'Aksesoris Komputer', stok: 120, minStok: 20, satuan: 'Pcs', status: 'aktif', keterangan: 'Silent Click 2.4GHz' },
  { id: 3, idBarang: 'BRG003', namaBarang: 'Keyboard Mechanical Keychron K2', kategori: 'Aksesoris Komputer', stok: 8, minStok: 10, satuan: 'Unit', status: 'aktif', keterangan: 'Gateron Brown Switch (Stok Menipis)' },
  { id: 4, idBarang: 'BRG004', namaBarang: 'Monitor LG 24 Inch IPS 75Hz', kategori: 'Elektronik', stok: 30, minStok: 5, satuan: 'Unit', status: 'aktif', keterangan: 'Full HD Borderless' },
  { id: 5, idBarang: 'BRG005', namaBarang: 'Kabel HDMI 2.0 1.5 Meter', kategori: 'Kabel & Konektor', stok: 200, minStok: 30, satuan: 'Pcs', status: 'aktif', keterangan: 'Gold Plated 4K@60Hz' },
  { id: 6, idBarang: 'BRG006', namaBarang: 'Kertas HVS A4 80gr PaperOne', kategori: 'Alat Tulis Kantor', stok: 85, minStok: 15, satuan: 'Rim', status: 'aktif', keterangan: 'Isi 500 lembar per rim' },
  { id: 7, idBarang: 'BRG007', namaBarang: 'Printer Epson L3210 EcoTank', kategori: 'Elektronik', stok: 3, minStok: 5, satuan: 'Unit', status: 'aktif', keterangan: 'All-in-One Ink Tank (Perlu Restok)' },
  { id: 8, idBarang: 'BRG008', namaBarang: 'Lakban Bening 2 Inch 100 Yard', kategori: 'Kemasan & Logistik', stok: 150, minStok: 25, satuan: 'Roll', status: 'aktif', keterangan: 'Daya rekat tinggi' }
];

const INITIAL_USERS: User[] = [
  { id: 1, nama: 'Administrator Gudang', email: 'admin@gudang.com', passwordHash: 'admin', role: 'admin' },
  { id: 2, nama: 'Dimas Frandika', email: 'dimasfrandika87@gmail.com', passwordHash: 'password123', role: 'petugas' },
  { id: 3, nama: 'Budi Santoso', email: 'petugas@gudang.com', passwordHash: 'petugas123', role: 'petugas' }
];

const INITIAL_PENGATURAN: PengaturanGudang = {
  namaKepalaBagian: 'Hendrawan Pratama, S.T., M.M.',
  nipKepalaBagian: '19840315 200812 1 002',
  namaPerusahaan: 'PT Global Logistik Nusantara',
  alamatGudang: 'Kawasan Industri Pergudangan Terpadu Blok C-12'
};

const INITIAL_MASUK: TransaksiBarangMasuk[] = [
  {
    id: 1,
    noDokumen: 'BM-20261010-001',
    tanggal: '2026-10-10',
    supplier: 'PT Asus Indonesia Tech',
    noSuratJalan: 'SJ-ASUS/2026/10/881',
    petugas: 'Dimas Frandika',
    catatan: 'Pengiriman pasokan batch pertama Q4',
    items: [
      { barangId: 1, idBarang: 'BRG001', namaBarang: 'Laptop ASUS VivoBook 15', jumlah: 10, satuan: 'Unit' },
      { barangId: 4, idBarang: 'BRG004', namaBarang: 'Monitor LG 24 Inch IPS 75Hz', jumlah: 5, satuan: 'Unit' }
    ]
  },
  {
    id: 2,
    noDokumen: 'BM-20261012-002',
    tanggal: '2026-10-12',
    supplier: 'CV Mitra Distributor Komputer',
    noSuratJalan: 'MDK-DO-4592',
    petugas: 'Budi Santoso',
    catatan: 'Kondisi barang baik & segel pabrik aman',
    items: [
      { barangId: 2, idBarang: 'BRG002', namaBarang: 'Mouse Wireless Logitech M331', jumlah: 50, satuan: 'Pcs' },
      { barangId: 5, idBarang: 'BRG005', namaBarang: 'Kabel HDMI 2.0 1.5 Meter', jumlah: 40, satuan: 'Pcs' }
    ]
  }
];

const INITIAL_KELUAR: TransaksiBarangKeluar[] = [
  {
    id: 1,
    noDokumen: 'BK-20261011-001',
    tanggal: '2026-10-11',
    tujuan: 'Divisi IT & Pengembangan',
    namaPenerima: 'Rian Hidayat (Staff IT)',
    keterangan: 'Fasilitas perlengkapan workstation karyawan baru',
    petugas: 'Dimas Frandika',
    kepalaBagian: 'Hendrawan Pratama, S.T., M.M.',
    items: [
      { barangId: 1, idBarang: 'BRG001', namaBarang: 'Laptop ASUS VivoBook 15', jumlah: 2, satuan: 'Unit', keterangan: 'Unit laptop developer' },
      { barangId: 2, idBarang: 'BRG002', namaBarang: 'Mouse Wireless Logitech M331', jumlah: 2, satuan: 'Pcs', keterangan: 'Mouse wireless silent' },
      { barangId: 5, idBarang: 'BRG005', namaBarang: 'Kabel HDMI 2.0 1.5 Meter', jumlah: 2, satuan: 'Pcs', keterangan: 'Kabel display monitor' }
    ]
  },
  {
    id: 2,
    noDokumen: 'BK-20261013-002',
    tanggal: '2026-10-13',
    tujuan: 'Toko Cabang Jakarta Selatan',
    namaPenerima: 'Siti Rahma (Supervisor Toko)',
    keterangan: 'Distribusi stok etalase toko cabang',
    petugas: 'Budi Santoso',
    kepalaBagian: 'Hendrawan Pratama, S.T., M.M.',
    items: [
      { barangId: 2, idBarang: 'BRG002', namaBarang: 'Mouse Wireless Logitech M331', jumlah: 15, satuan: 'Pcs' },
      { barangId: 6, idBarang: 'BRG006', namaBarang: 'Kertas HVS A4 80gr PaperOne', jumlah: 10, satuan: 'Rim' }
    ]
  }
];

export class BarangRepository {
  private getStore(): Barang[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BARANG);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore(INITIAL_BARANG);
    return INITIAL_BARANG;
  }

  private saveStore(items: Barang[]) {
    try {
      localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save barang to localStorage', e);
    }
  }

  getAll(includeInactive = true): Barang[] {
    const list = this.getStore();
    if (includeInactive) {
      return list.sort((a, b) => a.id - b.id);
    }
    return list.filter(b => b.status === 'aktif').sort((a, b) => a.id - b.id);
  }

  getById(id: number): Barang | null {
    const list = this.getStore();
    return list.find(b => b.id === id) || null;
  }

  insert(barang: Omit<Barang, 'id'>): { success: boolean; data?: Barang; message?: string } {
    const list = this.getStore();
    if (list.some(b => b.idBarang.toLowerCase() === barang.idBarang.trim().toLowerCase())) {
      return { success: false, message: `Kode Barang '${barang.idBarang}' sudah terdaftar!` };
    }

    const nextId = list.length > 0 ? Math.max(...list.map(b => b.id)) + 1 : 1;
    const newBarang: Barang = {
      id: nextId,
      idBarang: barang.idBarang.trim().toUpperCase(),
      namaBarang: barang.namaBarang.trim(),
      kategori: barang.kategori.trim() || 'Umum',
      stok: Number(barang.stok) || 0,
      minStok: Number(barang.minStok) || 0,
      satuan: barang.satuan.trim() || 'Unit',
      status: barang.status || 'aktif',
      keterangan: barang.keterangan?.trim() || ''
    };

    list.push(newBarang);
    this.saveStore(list);
    fetch('/api/barang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBarang)
    }).catch(err => console.warn('Cloud SQL insert sync warning:', err));
    return { success: true, data: newBarang };
  }

  update(barang: Barang): { success: boolean; message?: string } {
    const list = this.getStore();
    const index = list.findIndex(b => b.id === barang.id);
    if (index === -1) {
      return { success: false, message: 'Data barang tidak ditemukan!' };
    }

    const duplicate = list.find(b => b.id !== barang.id && b.idBarang.toLowerCase() === barang.idBarang.trim().toLowerCase());
    if (duplicate) {
      return { success: false, message: `Kode Barang '${barang.idBarang}' sudah digunakan barang lain!` };
    }

    list[index] = {
      ...list[index],
      idBarang: barang.idBarang.trim().toUpperCase(),
      namaBarang: barang.namaBarang.trim(),
      kategori: barang.kategori.trim() || 'Umum',
      stok: Number(barang.stok) || 0,
      minStok: Number(barang.minStok) || 0,
      satuan: barang.satuan.trim() || 'Unit',
      status: barang.status || 'aktif',
      keterangan: barang.keterangan?.trim() || ''
    };

    this.saveStore(list);
    fetch(`/api/barang/${barang.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list[index])
    }).catch(err => console.warn('Cloud SQL update sync warning:', err));
    return { success: true };
  }

  toggleStatus(id: number): { success: boolean; newStatus?: 'aktif' | 'nonaktif'; message?: string } {
    const list = this.getStore();
    const item = list.find(b => b.id === id);
    if (!item) {
      return { success: false, message: 'Barang tidak ditemukan' };
    }
    const newStatus: 'aktif' | 'nonaktif' = item.status === 'aktif' ? 'nonaktif' : 'aktif';
    item.status = newStatus;
    this.saveStore(list);
    fetch(`/api/barang/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(err => console.warn('Cloud SQL toggleStatus sync warning:', err));
    return { success: true, newStatus };
  }

  delete(id: number): { success: boolean; message?: string } {
    const list = this.getStore();
    const filtered = list.filter(b => b.id !== id);
    this.saveStore(filtered);
    fetch(`/api/barang/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Cloud SQL delete sync warning:', err));
    return { success: true };
  }

  updateStok(id: number, delta: number): { success: boolean; newStok?: number; message?: string } {
    const list = this.getStore();
    const item = list.find(b => b.id === id);
    if (!item) {
      return { success: false, message: 'Barang tidak ditemukan' };
    }

    const calculated = item.stok + delta;
    if (calculated < 0) {
      return { success: false, message: `Stok tidak mencukupi untuk '${item.namaBarang}'! Stok saat ini: ${item.stok}` };
    }

    item.stok = calculated;
    this.saveStore(list);
    return { success: true, newStok: item.stok };
  }
}

export class TransaksiMasukRepository {
  private getStore(): TransaksiBarangMasuk[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MASUK);
      if (data) {
        const parsed = JSON.parse(data);
        // Normalize single-item to items array if any legacy record exists
        return parsed.map((item: any) => {
          if (!item.items && item.namaBarang) {
            return {
              ...item,
              items: [{
                barangId: item.barangId,
                idBarang: item.idBarang,
                namaBarang: item.namaBarang,
                jumlah: item.jumlah,
                satuan: item.satuan,
                keterangan: item.catatan
              }]
            };
          }
          return item;
        });
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore(INITIAL_MASUK);
    return INITIAL_MASUK;
  }

  private saveStore(items: TransaksiBarangMasuk[]) {
    try {
      localStorage.setItem(STORAGE_KEY_MASUK, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save transaksi masuk', e);
    }
  }

  getAll(): TransaksiBarangMasuk[] {
    return this.getStore().sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  insert(data: Omit<TransaksiBarangMasuk, 'id'>): { success: boolean; message?: string; data?: TransaksiBarangMasuk } {
    const barangRepo = new BarangRepository();

    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Harus ada minimal 1 barang dalam transaksi penerimaan!' };
    }

    for (const item of data.items) {
      if (item.jumlah <= 0) {
        return { success: false, message: `Jumlah masuk untuk barang '${item.namaBarang}' harus lebih dari 0!` };
      }
      const barang = barangRepo.getById(item.barangId);
      if (!barang) {
        return { success: false, message: `Barang dengan ID ${item.barangId} tidak ditemukan di sistem!` };
      }
    }

    // Apply stock additions
    for (const item of data.items) {
      barangRepo.updateStok(item.barangId, item.jumlah);
    }

    const list = this.getStore();
    const nextId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
    const newRecord: TransaksiBarangMasuk = {
      ...data,
      id: nextId
    };

    list.unshift(newRecord);
    this.saveStore(list);
    fetch('/api/transaksi-masuk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch(err => console.warn('Cloud SQL transaksi masuk sync warning:', err));
    return { success: true, data: newRecord };
  }
}

export class TransaksiKeluarRepository {
  private getStore(): TransaksiBarangKeluar[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_KELUAR);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((item: any) => {
          if (!item.items && item.namaBarang) {
            return {
              ...item,
              namaPenerima: item.namaPenerima || 'Penerima Barang',
              items: [{
                barangId: item.barangId,
                idBarang: item.idBarang,
                namaBarang: item.namaBarang,
                jumlah: item.jumlah,
                satuan: item.satuan,
                keterangan: item.keterangan
              }]
            };
          }
          return item;
        });
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore(INITIAL_KELUAR);
    return INITIAL_KELUAR;
  }

  private saveStore(items: TransaksiBarangKeluar[]) {
    try {
      localStorage.setItem(STORAGE_KEY_KELUAR, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save transaksi keluar', e);
    }
  }

  getAll(): TransaksiBarangKeluar[] {
    return this.getStore().sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  insert(data: Omit<TransaksiBarangKeluar, 'id'>): { success: boolean; message?: string; data?: TransaksiBarangKeluar; warnings?: string[] } {
    const barangRepo = new BarangRepository();

    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Harus ada minimal 1 barang dalam transaksi pengeluaran!' };
    }

    // First validate ALL items stock
    for (const item of data.items) {
      if (item.jumlah <= 0) {
        return { success: false, message: `Jumlah pengeluaran untuk barang '${item.namaBarang}' harus lebih dari 0!` };
      }
      const barang = barangRepo.getById(item.barangId);
      if (!barang) {
        return { success: false, message: `Barang '${item.namaBarang}' tidak ditemukan di sistem!` };
      }
      if (barang.stok < item.jumlah) {
        return {
          success: false,
          message: `Stok tidak mencukupi untuk '${barang.namaBarang}'! Stok tersedia: ${barang.stok} ${barang.satuan}, jumlah diminta: ${item.jumlah} ${barang.satuan}.`
        };
      }
    }

    // Now safely deduct all
    const warnings: string[] = [];
    for (const item of data.items) {
      const res = barangRepo.updateStok(item.barangId, -item.jumlah);
      const barang = barangRepo.getById(item.barangId);
      if (barang && res.newStok !== undefined && res.newStok <= barang.minStok) {
        warnings.push(`Perhatian: Stok '${barang.namaBarang}' tersisa ${res.newStok} ${barang.satuan} (mencapai batas min: ${barang.minStok} ${barang.satuan}).`);
      }
    }

    const list = this.getStore();
    const nextId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
    const newRecord: TransaksiBarangKeluar = {
      ...data,
      id: nextId
    };

    list.unshift(newRecord);
    this.saveStore(list);
    fetch('/api/transaksi-keluar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch(err => console.warn('Cloud SQL transaksi keluar sync warning:', err));
    return { success: true, data: newRecord, warnings };
  }
}

export class UserRepository {
  private getStore(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore(INITIAL_USERS);
    return INITIAL_USERS;
  }

  private saveStore(users: User[]) {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users', e);
    }
  }

  findByEmail(email: string): User | null {
    const users = this.getStore();
    return users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase()) || null;
  }

  save(nama: string, email: string, passwordHash: string, role: 'admin' | 'petugas'): User {
    const users = this.getStore();
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId,
      nama: nama.trim() || email.split('@')[0],
      email: email.trim(),
      passwordHash: passwordHash,
      role: role
    };
    users.push(newUser);
    this.saveStore(users);
    return newUser;
  }

  getAll(): User[] {
    return this.getStore();
  }
}

export class AuthService {
  private userRepo = new UserRepository();

  register(nama: string, email: string, password: string, role: 'admin' | 'petugas' = 'petugas'): { success: boolean; message?: string } {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Email dan password wajib diisi' };
    }
    if (this.userRepo.findByEmail(email)) {
      return { success: false, message: 'Email sudah terdaftar' };
    }
    this.userRepo.save(nama, email, password, role);
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password, role })
    }).catch(err => console.warn('Cloud SQL register sync warning:', err));
    return { success: true, message: 'Registrasi berhasil, silakan login' };
  }

  login(email: string, password: string): { success: boolean; message?: string; user?: User } {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Email dan password wajib diisi' };
    }
    const user = this.userRepo.findByEmail(email);
    if (!user || user.passwordHash !== password) {
      return { success: false, message: 'Email atau password salah' };
    }

    SessionService.setSession({
      userId: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    });

    return { success: true, user };
  }
}

export const SessionService = {
  getSession(): UserSession {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Session retrieval error', e);
    }
    return { userId: null, nama: null, email: null, role: null };
  },

  setSession(session: UserSession) {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Session save error', e);
    }
  },

  isLoggedIn(): boolean {
    const session = this.getSession();
    return session.userId !== null;
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.warn('Session clear error', e);
    }
  }
};

export const PengaturanService = {
  getPengaturan(): PengaturanGudang {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PENGATURAN);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Pengaturan retrieval error', e);
    }
    this.savePengaturan(INITIAL_PENGATURAN);
    return INITIAL_PENGATURAN;
  },

  savePengaturan(pengaturan: PengaturanGudang) {
    try {
      localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(pengaturan));
      fetch('/api/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengaturan)
      }).catch(err => console.warn('Cloud SQL pengaturan sync warning:', err));
    } catch (e) {
      console.warn('Failed to save pengaturan', e);
    }
  }
};
