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

## File penting

- `src/auth.js` - semua logika auth ada di sini
- `src/index.js` - server utama
- `src/config/database.js` - koneksi PostgreSQL
- `src/config/auth.js` - setting JWT dan bcrypt

## Postman

Import file di folder `postman/` untuk test cepat.