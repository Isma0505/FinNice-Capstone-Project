# FinNice APP Backend

Backend ini memakai Express.js, PostgreSQL, JWT, dan bcryptjs.

## Struktur Ringkas

```
back-end/
├── package.json            # Wrapper agar npm run dev bisa dijalankan dari root backend
├── src/
│   ├── index.js            # Server utama
│   ├── package.json        # Dependencies backend
│   ├── .env                # Konfigurasi lokal
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
```

## Cara Menjalankan

Jalankan dari folder `back-end`:

```bash
npm run setup-db
npm run dev
```

Kalau mau jalan dari folder `back-end/src`, gunakan:

```bash
cd src
npm run setup-db
npm run dev
```

## Endpoint

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/logout`

## Catatan

- Database yang dipakai: `finnice_app`
- Frontend ada di folder `front-end`
- Frontend auth sudah diarahkan ke `http://localhost:5000`
