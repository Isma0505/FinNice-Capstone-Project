# FinNice Backend

Backend ini dipakai untuk auth dan API dasar FinNice.

## Cara jalanin

```bash
npm install
npm run setup-db
npm run dev
```

## Endpoint auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify`
- `POST /auth/resend`
- `GET /auth/profile`
- `POST /auth/logout`

## Endpoint finance + AI

- `POST /finance/advice` (fallback ke local rule jika AI service tidak aktif)
- `GET /finance/ai/status` (cek status AI Model service)
- `POST /finance/ai/predict` (proxy prediksi transaksi ke AI Model)
- `POST /finance/ai/recommend` (proxy rekomendasi ke AI Model)

## Environment variable tambahan

- `AI_SERVICE_URL` default `http://localhost:8001` untuk endpoint advice
- `AI_MODEL_SERVICE_URL` default `http://localhost:8001` untuk endpoint model AI service terbaru

## File penting

- `src/auth.js` - semua logika auth ada di sini
- `src/index.js` - server utama
- `src/config/database.js` - koneksi PostgreSQL
- `src/config/auth.js` - setting JWT dan bcrypt

## Postman

Import file di folder `postman/` untuk test cepat.