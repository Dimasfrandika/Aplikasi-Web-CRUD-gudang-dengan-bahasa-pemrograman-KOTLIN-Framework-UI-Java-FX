// File: tests/integration/api.test.js
const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('Integration Testing - REST API Sistem Gudang', () => {
  describe('1. Endpoint Health & Database Status', () => {
    it('GET /api/health harus mengembalikan status ok dan koneksi database', async () => {
      const res = await request(BASE_URL).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('connected', true);
    });
  });

  describe('2. Endpoint Autentikasi Pengguna (/api/auth/login)', () => {
    it('POST /api/auth/login harus berhasil login dengan kredensial petugas yang valid', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'petugas@gudang.com',
          password: 'rahasia123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('petugas@gudang.com');
      expect(res.body.user.role).toBe('petugas');
    });

    it('POST /api/auth/login harus menolak kredensial dengan password salah', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'petugas@gudang.com',
          password: 'password_salah_123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/auth/login harus menolak request tanpa email atau password', async () => {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('3. Endpoint Data Master & Transaksi', () => {
    it('GET /api/barang harus mengembalikan list array data barang', async () => {
      const res = await request(BASE_URL).get('/api/barang');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/pengaturan harus mengembalikan konfigurasi nama gudang dan kepala bagian', async () => {
      const res = await request(BASE_URL).get('/api/pengaturan');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('namaPerusahaan');
    });
  });
});
