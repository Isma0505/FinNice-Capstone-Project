# FinNice Frontend

Frontend ini adalah tampilan utama aplikasi FinNice. Di sini pengguna bisa melihat dashboard, transaksi, budget, akun, pengaturan, dan fitur lain yang terhubung ke backend.

## Isi panduan ini

- Persiapan sebelum menjalankan aplikasi
- Cara menginstal semua dependency
- Cara menjalankan backend
- Cara menjalankan frontend
- Cara menghentikan aplikasi
- Catatan penting untuk pengguna baru

## 1. Persiapan

Sebelum mulai, pastikan komputer sudah punya:

- Node.js versi LTS
- npm yang ikut terpasang bersama Node.js
- PostgreSQL jika ingin menjalankan backend secara penuh

Kalau kamu belum tahu Node.js sudah terpasang atau belum, buka terminal lalu jalankan:

```bash
node -v
npm -v
```

Kalau keluar versi, berarti sudah siap.

## 2. Struktur folder

Di workspace ini ada 2 bagian utama:

- `back-end/` untuk server, login, dan API data
- `frontend/` untuk tampilan aplikasi

Agar aplikasi jalan normal, backend sebaiknya dinyalakan dulu, lalu frontend.

## 3. Install dependency

Buka terminal di folder proyek utama, lalu install dependency untuk backend dan frontend.

### Install backend

```bash
cd back-end
npm install
```

### Install frontend

```bash
cd ../frontend
npm install
```

Kalau `npm install` selesai, semua modul yang dibutuhkan aplikasi sudah tersedia di komputer.

## 4. Menyalakan backend

Masuk ke folder backend lalu jalankan database setup dan server.

### Untuk pertama kali

```bash
cd back-end
npm run setup-db
npm run dev
```

### Untuk menjalankan backend biasa

Kalau database sudah pernah disiapkan, cukup jalankan:

```bash
cd back-end
npm run dev
```

Backend akan berjalan di:

```bash
http://localhost:5000
```

Kalau endpoint utama dibuka di browser, server akan menampilkan status berjalan.

## 5. Menyalakan frontend

Buka terminal baru, lalu jalankan frontend:

```bash
cd frontend
npm run dev
```

Setelah itu Vite akan menampilkan alamat lokal, biasanya seperti:

```bash
http://localhost:5173
```

Buka alamat itu di browser untuk memakai aplikasi FinNice.

## 6. Urutan yang disarankan

Supaya tidak error, jalankan dengan urutan ini:

1. Install semua dependency dengan `npm install` di backend dan frontend
2. Jalankan backend dengan `npm run dev`
3. Jalankan frontend dengan `npm run dev`
4. Buka alamat frontend di browser

## 7. Cara menghentikan aplikasi

Kalau mau berhenti:

- tekan `Ctrl + C` di terminal backend
- tekan `Ctrl + C` di terminal frontend

Kalau terminal bertanya apakah mau menghentikan proses, pilih `Y` atau tekan Enter.

## 8. Fitur utama yang bisa dipakai

Setelah aplikasi berjalan, pengguna bisa memakai:

- Dashboard ringkasan keuangan
- Transaksi pemasukan dan pengeluaran
- Budget per kategori
- Daftar akun bank dan e-wallet
- Pengaturan aplikasi
- Export laporan sesuai fitur yang tersedia di aplikasi

## 9. Catatan penting

- Data aplikasi disimpan lokal sesuai mekanisme yang ada di project ini.
- Kalau tampilan tidak berubah setelah update, coba refresh browser.
- Kalau backend tidak mau jalan, pastikan PostgreSQL aktif dan file konfigurasi database sudah benar.
- Kalau `npm run dev` gagal, lihat pesan error di terminal karena biasanya penyebabnya jelas, misalnya Node belum terpasang atau dependency belum lengkap.

## 10. Build frontend untuk production

Kalau ingin membuat hasil build frontend:

```bash
cd frontend
npm run build
```

Kalau ingin melihat hasil build secara lokal:

```bash
npm run preview
```

## 11. Bantuan cepat

Kalau aplikasi tidak bisa dibuka, coba cek ini dulu:

- Backend sudah jalan di port 5000
- Frontend sudah jalan di port 5173
- Terminal tidak menampilkan error merah
- Browser dibuka ke alamat frontend yang benar

Kalau kamu ingin, README ini juga bisa saya lengkapi dengan bagian screenshot, alur penggunaan menu, atau penjelasan fitur per halaman supaya lebih mudah dipahami pengguna non-IT.
