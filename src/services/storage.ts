import {
  Barang,
  User,
  UserSession,
  TransaksiBarangMasuk,
  TransaksiBarangKeluar,
  PengaturanGudang
} from '../types';

export const STORAGE_KEY_BARANG = 'gudang_barang_list_v3';
export const STORAGE_KEY_USERS = 'gudang_users_list_v3';
export const STORAGE_KEY_SESSION = 'gudang_user_session_v3';
export const STORAGE_KEY_MASUK = 'gudang_transaksi_masuk_v3';
export const STORAGE_KEY_KELUAR = 'gudang_transaksi_keluar_v3';
export const STORAGE_KEY_PENGATURAN = 'gudang_pengaturan_v3';

export interface SyncResult {
  success: boolean;
  barang: Barang[];
  masuk: TransaksiBarangMasuk[];
  keluar: TransaksiBarangKeluar[];
  pengaturan?: PengaturanGudang;
}

/**
 * Fetch fresh data directly from Express / Cloud SQL PostgreSQL API
 * and synchronize into local storage as offline cache.
 */
export async function syncAllFromBackend(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    barang: [],
    masuk: [],
    keluar: []
  };

  try {
    const [barangRes, masukRes, keluarRes, pengaturanRes, usersRes] = await Promise.all([
      fetch('/api/barang'),
      fetch('/api/transaksi-masuk'),
      fetch('/api/transaksi-keluar'),
      fetch('/api/pengaturan'),
      fetch('/api/users')
    ]);

    let okCount = 0;

    if (barangRes.ok) {
      const data = await barangRes.json();
      if (Array.isArray(data)) {
        result.barang = data;
        localStorage.setItem(STORAGE_KEY_BARANG, JSON.stringify(data));
        okCount++;
      }
    }

    if (masukRes.ok) {
      const data = await masukRes.json();
      if (Array.isArray(data)) {
        result.masuk = data;
        localStorage.setItem(STORAGE_KEY_MASUK, JSON.stringify(data));
        okCount++;
      }
    }

    if (keluarRes.ok) {
      const data = await keluarRes.json();
      if (Array.isArray(data)) {
        result.keluar = data;
        localStorage.setItem(STORAGE_KEY_KELUAR, JSON.stringify(data));
        okCount++;
      }
    }

    if (pengaturanRes.ok) {
      const data = await pengaturanRes.json();
      if (data && (data.namaKepalaBagian || data.namaPerusahaan)) {
        result.pengaturan = data;
        localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(data));
      }
    }

    if (usersRes.ok) {
      const data = await usersRes.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data));
      }
    }

    result.success = okCount >= 3;
  } catch (error) {
    console.warn('Backend sync failed, using cached data:', error);
    result.success = false;
  }

  return result;
}

const INITIAL_USERS: User[] = [
  { id: 1, nama: 'Administrator Gudang', email: 'admin@gudang.com', passwordHash: 'admin', role: 'admin' },
  { id: 2, nama: 'Dimas Frandika', email: 'dimasfrandika87@gmail.com', passwordHash: 'Dimas87frandika', role: 'admin' },
  { id: 3, nama: 'Budi Santoso', email: 'petugas@gudang.com', passwordHash: 'petugas123', role: 'petugas' }
];

const INITIAL_PENGATURAN: PengaturanGudang = {
  namaKepalaBagian: 'Hendrawan Pratama, S.T., M.M.',
  nipKepalaBagian: '19840315 200812 1 002',
  namaPerusahaan: 'PT Global Logistik Nusantara',
  alamatGudang: 'Kawasan Industri Pergudangan Terpadu Blok C-12'
};

export class BarangRepository {
  private getStore(): Barang[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BARANG);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore([]);
    return [];
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

  async fetchAllFromApi(): Promise<Barang[]> {
    try {
      const res = await fetch('/api/barang');
      if (!res.ok) throw new Error('Gagal mengambil data dari server');
      const data = await res.json();
      if (Array.isArray(data)) {
        this.saveStore(data);
        return data;
      }
    } catch (err) {
      console.warn('fetchAllFromApi fallback:', err);
    }
    return this.getAll();
  }

  async insertApi(barang: Omit<Barang, 'id'>): Promise<{ success: boolean; data?: Barang; message?: string }> {
    return this.insert(barang);
  }

  async insert(barang: Omit<Barang, 'id'>): Promise<{ success: boolean; data?: Barang; message?: string }> {
    try {
      const res = await fetch('/api/barang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barang)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Gagal menambahkan barang ke server' };
      }

      // Returned record has the authoritative database auto-increment ID
      const savedBarang: Barang = result.data;
      const list = this.getStore();
      const existingIdx = list.findIndex(b => b.id === savedBarang.id || b.idBarang === savedBarang.idBarang);
      if (existingIdx !== -1) {
        list[existingIdx] = savedBarang;
      } else {
        list.push(savedBarang);
      }
      this.saveStore(list);
      return { success: true, data: savedBarang };
    } catch (err: any) {
      console.warn('Network error, saving to local offline storage:', err);
      // Offline fallback: generate client id
      const list = this.getStore();
      if (list.some(b => b.idBarang.toLowerCase() === barang.idBarang.trim().toLowerCase())) {
        return { success: false, message: `Kode Barang '${barang.idBarang}' sudah terdaftar!` };
      }
      const nextId = list.length > 0 ? Math.max(...list.map(b => b.id)) + 1 : 1;
      const newBarang: Barang = {
        ...barang,
        id: nextId
      };
      list.push(newBarang);
      this.saveStore(list);
      return { success: true, data: newBarang };
    }
  }

  async update(barang: Barang): Promise<{ success: boolean; message?: string; data?: Barang }> {
    try {
      const res = await fetch(`/api/barang/${barang.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barang)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Gagal memperbarui barang di server' };
      }

      const updated = result.data || barang;
      const list = this.getStore();
      const index = list.findIndex(b => b.id === barang.id);
      if (index !== -1) {
        list[index] = updated;
      } else {
        list.push(updated);
      }
      this.saveStore(list);
      return { success: true, data: updated };
    } catch (err: any) {
      console.warn('Offline update fallback:', err);
      const list = this.getStore();
      const index = list.findIndex(b => b.id === barang.id);
      if (index === -1) {
        return { success: false, message: 'Data barang tidak ditemukan!' };
      }
      list[index] = barang;
      this.saveStore(list);
      return { success: true, data: barang };
    }
  }

  async toggleStatus(id: number): Promise<{ success: boolean; newStatus?: 'aktif' | 'nonaktif'; message?: string }> {
    const list = this.getStore();
    const item = list.find(b => b.id === id);
    if (!item) {
      return { success: false, message: 'Barang tidak ditemukan' };
    }
    const newStatus: 'aktif' | 'nonaktif' = item.status === 'aktif' ? 'nonaktif' : 'aktif';
    const updated = { ...item, status: newStatus };
    return this.update(updated).then(res => {
      if (res.success) {
        return { success: true, newStatus };
      }
      return { success: false, message: res.message };
    });
  }

  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/barang/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const result = await res.json();
        return { success: false, message: result.error || 'Gagal menghapus barang dari server' };
      }
    } catch (err: any) {
      console.warn('Offline delete fallback:', err);
    }

    const list = this.getStore();
    const filtered = list.filter(b => b.id !== id);
    this.saveStore(filtered);
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
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore([]);
    return [];
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

  async fetchAllFromApi(): Promise<TransaksiBarangMasuk[]> {
    try {
      const res = await fetch('/api/transaksi-masuk');
      if (!res.ok) throw new Error('Gagal memuat transaksi masuk');
      const data = await res.json();
      if (Array.isArray(data)) {
        this.saveStore(data);
        return data;
      }
    } catch (err) {
      console.warn('fetchAllFromApi transaksi masuk fallback:', err);
    }
    return this.getAll();
  }

  async insertApi(data: Omit<TransaksiBarangMasuk, 'id'>): Promise<{ success: boolean; message?: string; data?: TransaksiBarangMasuk }> {
    return this.insert(data);
  }

  async insert(data: Omit<TransaksiBarangMasuk, 'id'>): Promise<{ success: boolean; message?: string; data?: TransaksiBarangMasuk }> {
    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Harus ada minimal 1 barang dalam transaksi penerimaan!' };
    }

    for (const item of data.items) {
      if (item.jumlah <= 0) {
        return { success: false, message: `Jumlah masuk untuk barang '${item.namaBarang}' harus lebih dari 0!` };
      }
    }

    try {
      const res = await fetch('/api/transaksi-masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Gagal menyimpan transaksi masuk ke server' };
      }

      const saved: TransaksiBarangMasuk = result.data;
      const list = this.getStore();
      list.unshift(saved);
      this.saveStore(list);

      // Also update local stocks to reflect increment
      const barangRepo = new BarangRepository();
      for (const item of saved.items) {
        barangRepo.updateStok(item.barangId, item.jumlah);
      }

      return { success: true, data: saved };
    } catch (err: any) {
      console.warn('Network error, saving inbound transaction locally:', err);
      const barangRepo = new BarangRepository();
      for (const item of data.items) {
        barangRepo.updateStok(item.barangId, item.jumlah);
      }
      const list = this.getStore();
      const nextId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
      const localRecord: TransaksiBarangMasuk = {
        ...data,
        id: nextId
      };
      list.unshift(localRecord);
      this.saveStore(list);
      return { success: true, data: localRecord };
    }
  }
}

export class TransaksiKeluarRepository {
  private getStore(): TransaksiBarangKeluar[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_KELUAR);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    this.saveStore([]);
    return [];
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

  async fetchAllFromApi(): Promise<TransaksiBarangKeluar[]> {
    try {
      const res = await fetch('/api/transaksi-keluar');
      if (!res.ok) throw new Error('Gagal memuat transaksi keluar');
      const data = await res.json();
      if (Array.isArray(data)) {
        this.saveStore(data);
        return data;
      }
    } catch (err) {
      console.warn('fetchAllFromApi transaksi keluar fallback:', err);
    }
    return this.getAll();
  }

  async insertApi(data: Omit<TransaksiBarangKeluar, 'id'>): Promise<{ success: boolean; message?: string; data?: TransaksiBarangKeluar; warnings?: string[] }> {
    return this.insert(data);
  }

  async insert(data: Omit<TransaksiBarangKeluar, 'id'>): Promise<{ success: boolean; message?: string; data?: TransaksiBarangKeluar; warnings?: string[] }> {
    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Harus ada minimal 1 barang dalam transaksi pengeluaran!' };
    }

    try {
      const res = await fetch('/api/transaksi-keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Gagal menyimpan transaksi keluar ke server' };
      }

      const saved: TransaksiBarangKeluar = result.data;
      const list = this.getStore();
      list.unshift(saved);
      this.saveStore(list);

      // Decrement local stock
      const barangRepo = new BarangRepository();
      const warnings: string[] = [];
      for (const item of saved.items) {
        const stockRes = barangRepo.updateStok(item.barangId, -item.jumlah);
        const b = barangRepo.getById(item.barangId);
        if (b && stockRes.newStok !== undefined && stockRes.newStok <= b.minStok) {
          warnings.push(`Perhatian: Stok '${b.namaBarang}' tersisa ${stockRes.newStok} ${b.satuan} (mencapai batas minimum: ${b.minStok} ${b.satuan}).`);
        }
      }

      return { success: true, data: saved, warnings };
    } catch (err: any) {
      console.warn('Network error, saving outbound transaction locally:', err);
      const barangRepo = new BarangRepository();
      const warnings: string[] = [];
      for (const item of data.items) {
        const stockRes = barangRepo.updateStok(item.barangId, -item.jumlah);
        const b = barangRepo.getById(item.barangId);
        if (b && stockRes.newStok !== undefined && stockRes.newStok <= b.minStok) {
          warnings.push(`Perhatian: Stok '${b.namaBarang}' tersisa ${stockRes.newStok} ${b.satuan} (batas minimum: ${b.minStok}).`);
        }
      }
      const list = this.getStore();
      const nextId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
      const localRecord: TransaksiBarangKeluar = {
        ...data,
        id: nextId
      };
      list.unshift(localRecord);
      this.saveStore(list);
      return { success: true, data: localRecord, warnings };
    }
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

  async register(nama: string, email: string, password: string, role: 'admin' | 'petugas' = 'petugas'): Promise<{ success: boolean; message?: string }> {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Email dan password wajib diisi' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, role })
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Gagal mendaftar akun di server' };
      }

      this.userRepo.save(nama, email, password, role);
      return { success: true, message: 'Registrasi berhasil, silakan login' };
    } catch (err: any) {
      console.warn('Register fallback to local:', err);
      if (this.userRepo.findByEmail(email)) {
        return { success: false, message: 'Email sudah terdaftar' };
      }
      this.userRepo.save(nama, email, password, role);
      return { success: true, message: 'Registrasi berhasil (mode offline), silakan login' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Email dan password wajib diisi' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();
      if (res.ok && result.success && result.user) {
        const user: User = {
          id: result.user.id,
          nama: result.user.nama,
          email: result.user.email,
          passwordHash: '',
          role: result.user.role
        };
        SessionService.setSession({
          userId: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role
        });
        return { success: true, user };
      }
      if (!res.ok) {
        return { success: false, message: result.error || 'Email atau password salah' };
      }
    } catch (err) {
      console.warn('API login failed, checking local credentials:', err);
    }

    // Local fallback check
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

  async fetchPengaturanFromApi(): Promise<PengaturanGudang> {
    try {
      const res = await fetch('/api/pengaturan');
      if (res.ok) {
        const data = await res.json();
        if (data && (data.namaKepalaBagian || data.namaPerusahaan)) {
          localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('fetchPengaturanFromApi fallback:', err);
    }
    return this.getPengaturan();
  },

  async savePengaturan(pengaturan: PengaturanGudang): Promise<{ success: boolean; message?: string }> {
    try {
      localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(pengaturan));
      const res = await fetch('/api/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengaturan)
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.error || 'Gagal menyimpan pengaturan ke server' };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Failed to save pengaturan online, saved locally:', e);
      return { success: true };
    }
  }
};
