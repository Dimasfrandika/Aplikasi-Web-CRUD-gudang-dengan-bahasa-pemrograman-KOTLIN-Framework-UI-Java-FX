import { Given, When, Then, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, expect } from '@playwright/test';

// Set timeout agar pengujian browser tidak terputus saat loading
setDefaultTimeout(30000);

let browser;
let context;
let page;

// Buka browser sebelum pengujian dimulai
BeforeAll(async () => {
  // Jika di lingkungan server/CI tanpa monitor (Linux tanpa $DISPLAY), otomatis aktifkan headless: true.
  // Saat dijalankan di komputer lokal Anda (Windows/macOS), browser akan terbuka (headless: false).
  const isHeadless = process.env.HEADLESS === 'true' || (!process.env.DISPLAY && process.platform === 'linux');

  browser = await chromium.launch({
    headless: isHeadless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Buat context browser baru yang bersih dari cookies & localStorage
  context = await browser.newContext();
  page = await context.newPage();
});

// Tutup browser setelah selesai
AfterAll(async () => {
  if (page) await page.close();
  if (context) await context.close();
  if (browser) await browser.close();
});

Given('Pengguna membuka halaman login aplikasi gudang', async () => {
  // Gunakan localhost / 127.0.0.1 port 3000 tempat aplikasi gudang berjalan
  const targetUrl = process.env.TEST_URL || 'http://localhost:3000';
  await page.goto(targetUrl);
  await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 15000 });
});

When('Pengguna mengetik email {string} dan password {string}', async (email, password) => {
  // Sesuaikan selector (type="email" atau id input) dengan kode web Anda
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
});

When('Pengguna menekan tombol {string}', async (_teksTombol) => {
  await page.click('button[type="submit"]');
});

Then('Sistem harus mengarahkan pengguna ke halaman Dashboard', async () => {
  // Memastikan setelah login berhasil, URL berpindah ke /dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // Memastikan elemen header/dashboard utama sistem gudang sudah tampil di layar
  await expect(page.locator('.header-title')).toBeVisible({ timeout: 15000 });
});
