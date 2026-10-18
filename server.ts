import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { db } from './src/db/index.ts';
import { users, barang, transaksiMasuk, transaksiKeluar, pengaturanGudang } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API: Health & Status check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const userCount = await db.select().from(users).limit(1);
    res.json({
      status: 'ok',
      database: 'PostgreSQL (Cloud SQL)',
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check database query error:', error);
    res.status(500).json({
      status: 'error',
      database: 'PostgreSQL (Cloud SQL)',
      connected: false,
      error: error.message
    });
  }
});

// API: Users
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(users).orderBy(users.id);
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const list = await db.select().from(users);
    const found = list.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return res.status(401).json({ error: 'Email tidak terdaftar!' });
    }

    if (found.passwordHash !== password) {
      return res.status(401).json({ error: 'Password salah!' });
    }

    return res.json({
      success: true,
      user: {
        id: found.id,
        nama: found.nama,
        email: found.email,
        role: found.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat login' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { nama, email, password, role } = req.body;
  if (!nama || !email || !password) {
    return res.status(400).json({ error: 'Semua kolom wajib diisi' });
  }

  try {
    const existing = await db.select().from(users);
    if (existing.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Email sudah terdaftar!' });
    }

    const [inserted] = await db.insert(users).values({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      role: 'petugas'
    }).returning();

    return res.json({ success: true, user: inserted });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Gagal mendaftarkan akun ke database' });
  }
});

// API: Master Barang (CRUD)
app.get('/api/barang', async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(barang).orderBy(barang.id);
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching barang:', error);
    res.status(500).json({ error: 'Gagal memuat data barang dari database' });
  }
});

app.post('/api/barang', async (req: Request, res: Response) => {
  const { idBarang, namaBarang, kategori, stok, minStok, satuan, status, keterangan } = req.body;
  if (!idBarang || !namaBarang) {
    return res.status(400).json({ error: 'Kode Barang dan Nama Barang wajib diisi' });
  }

  try {
    const existing = await db.select().from(barang);
    if (existing.some(b => b.idBarang.toLowerCase() === idBarang.trim().toLowerCase())) {
      return res.status(400).json({ error: `Kode Barang '${idBarang}' sudah terdaftar di database!` });
    }

    const [inserted] = await db.insert(barang).values({
      idBarang: idBarang.trim().toUpperCase(),
      namaBarang: namaBarang.trim(),
      kategori: (kategori || 'Umum').trim(),
      stok: Number(stok) || 0,
      minStok: Number(minStok) || 0,
      satuan: (satuan || 'Unit').trim(),
      status: status === 'nonaktif' ? 'nonaktif' : 'aktif',
      keterangan: (keterangan || '').trim()
    }).returning();

    return res.json({ success: true, data: inserted });
  } catch (error: any) {
    console.error('Error inserting barang:', error);
    return res.status(500).json({ error: 'Gagal menambahkan barang ke database' });
  }
});

app.put('/api/barang/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { idBarang, namaBarang, kategori, stok, minStok, satuan, status, keterangan } = req.body;

  try {
    const [updated] = await db.update(barang).set({
      idBarang: idBarang.trim().toUpperCase(),
      namaBarang: namaBarang.trim(),
      kategori: (kategori || 'Umum').trim(),
      stok: Number(stok) || 0,
      minStok: Number(minStok) || 0,
      satuan: (satuan || 'Unit').trim(),
      status: status === 'nonaktif' ? 'nonaktif' : 'aktif',
      keterangan: (keterangan || '').trim()
    }).where(eq(barang.id, id)).returning();

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating barang:', error);
    return res.status(500).json({ error: 'Gagal memperbarui barang di database' });
  }
});

app.delete('/api/barang/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    await db.delete(barang).where(eq(barang.id, id));
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting barang:', error);
    return res.status(500).json({ error: 'Gagal menghapus barang dari database' });
  }
});

// API: Transaksi Barang Masuk
app.get('/api/transaksi-masuk', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(transaksiMasuk).orderBy(desc(transaksiMasuk.id));
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching inbound transactions:', error);
    res.status(500).json({ error: 'Gagal memuat transaksi barang masuk' });
  }
});

app.post('/api/transaksi-masuk', async (req: Request, res: Response) => {
  const { noDokumen, tanggal, supplier, noSuratJalan, petugas, catatan, items } = req.body;
  if (!noDokumen || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data transaksi dan barang masuk wajib diisi' });
  }

  try {
    // 1. Insert transaction
    const [inserted] = await db.insert(transaksiMasuk).values({
      noDokumen: noDokumen.trim(),
      tanggal: tanggal.trim(),
      supplier: (supplier || '').trim(),
      noSuratJalan: (noSuratJalan || '').trim(),
      petugas: (petugas || '').trim(),
      catatan: (catatan || '').trim(),
      items: items
    }).returning();

    // 2. Increment stock in barang table for each item
    for (const item of items) {
      const allBarang = await db.select().from(barang);
      const target = allBarang.find(b => b.id === item.barangId || b.idBarang === item.idBarang);
      if (target) {
        await db.update(barang)
          .set({ stok: target.stok + Number(item.jumlah) })
          .where(eq(barang.id, target.id));
      }
    }

    return res.json({ success: true, data: inserted });
  } catch (error: any) {
    console.error('Error creating inbound transaction:', error);
    return res.status(500).json({ error: 'Gagal menyimpan transaksi barang masuk ke database' });
  }
});

// API: Transaksi Barang Keluar
app.get('/api/transaksi-keluar', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(transaksiKeluar).orderBy(desc(transaksiKeluar.id));
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching outbound transactions:', error);
    res.status(500).json({ error: 'Gagal memuat transaksi barang keluar' });
  }
});

app.post('/api/transaksi-keluar', async (req: Request, res: Response) => {
  const { noDokumen, tanggal, tujuan, namaPenerima, keterangan, petugas, items } = req.body;
  if (!noDokumen || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data transaksi dan barang keluar wajib diisi' });
  }

  try {
    // Check stock availability
    const allBarang = await db.select().from(barang);
    for (const item of items) {
      const target = allBarang.find(b => b.id === item.barangId || b.idBarang === item.idBarang);
      if (!target) {
        return res.status(400).json({ error: `Barang '${item.namaBarang}' tidak ditemukan!` });
      }
      if (target.stok < Number(item.jumlah)) {
        return res.status(400).json({
          error: `Stok tidak mencukupi untuk '${target.namaBarang}'! Stok saat ini: ${target.stok}, diminta: ${item.jumlah}`
        });
      }
    }

    // 1. Insert transaction
    const [inserted] = await db.insert(transaksiKeluar).values({
      noDokumen: noDokumen.trim(),
      tanggal: tanggal.trim(),
      tujuan: (tujuan || '').trim(),
      namaPenerima: (namaPenerima || '').trim(),
      keterangan: (keterangan || '').trim(),
      petugas: (petugas || '').trim(),
      items: items
    }).returning();

    // 2. Decrement stock
    for (const item of items) {
      const target = allBarang.find(b => b.id === item.barangId || b.idBarang === item.idBarang);
      if (target) {
        await db.update(barang)
          .set({ stok: Math.max(0, target.stok - Number(item.jumlah)) })
          .where(eq(barang.id, target.id));
      }
    }

    return res.json({ success: true, data: inserted });
  } catch (error: any) {
    console.error('Error creating outbound transaction:', error);
    return res.status(500).json({ error: 'Gagal menyimpan transaksi barang keluar ke database' });
  }
});

// API: Pengaturan Gudang
app.get('/api/pengaturan', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(pengaturanGudang).limit(1);
    if (list.length > 0) {
      res.json(list[0]);
    } else {
      res.json({
        namaKepalaBagian: 'Hendrawan Pratama, S.T., M.M.',
        nipKepalaBagian: '19840315 200812 1 002',
        namaPerusahaan: 'PT Global Logistik Nusantara',
        alamatGudang: 'Kawasan Industri Pergudangan Terpadu Blok C-12'
      });
    }
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Gagal memuat pengaturan gudang' });
  }
});

app.put('/api/pengaturan', async (req: Request, res: Response) => {
  const { namaKepalaBagian, nipKepalaBagian, namaPerusahaan, alamatGudang } = req.body;
  try {
    const list = await db.select().from(pengaturanGudang).limit(1);
    if (list.length > 0) {
      const [updated] = await db.update(pengaturanGudang).set({
        namaKepalaBagian: (namaKepalaBagian || '').trim(),
        nipKepalaBagian: (nipKepalaBagian || '').trim(),
        namaPerusahaan: (namaPerusahaan || '').trim(),
        alamatGudang: (alamatGudang || '').trim(),
        updatedAt: new Date()
      }).where(eq(pengaturanGudang.id, list[0].id)).returning();
      return res.json({ success: true, data: updated });
    } else {
      const [inserted] = await db.insert(pengaturanGudang).values({
        namaKepalaBagian: (namaKepalaBagian || '').trim(),
        nipKepalaBagian: (nipKepalaBagian || '').trim(),
        namaPerusahaan: (namaPerusahaan || '').trim(),
        alamatGudang: (alamatGudang || '').trim()
      }).returning();
      return res.json({ success: true, data: inserted });
    }
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Gagal menyimpan pengaturan ke database' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
