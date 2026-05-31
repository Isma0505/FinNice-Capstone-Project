# FinNice App Tutorial

Panduan ini dibuat supaya project FinNice bisa dijalankan dengan mudah, tanpa harus paham istilah teknis dulu. Isinya mencakup backend, frontend, dan ai-service.

## 1. Struktur project

Project ini terdiri dari 3 bagian:

- `back-end/` untuk bagian server dan data
- `frontend/` untuk tampilan aplikasi
- `ai-service/` untuk fitur AI

## 2. Prasyarat

Sebelum mulai, pastikan laptop sudah punya:

- Node.js
- npm
- Python 3.10+ untuk `ai-service`
- PostgreSQL untuk backend

Kalau mau cek cepat, jalankan ini di terminal:

```bash
node -v
npm -v
python --version
```

## 3. Cara install file pendukung

Jalankan langkah ini dari folder utama project.

### Backend

```bash
cd back-end
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

### AI Service

Untuk bagian AI, buat ruang kerja Python dulu supaya file install-nya tidak bercampur dengan project lain.

```bash
cd ../ai-service
python -m venv .venv
```

Setelah itu, aktifkan ruang kerja tersebut:

```bash
.venv\\Scripts\\activate
```

Lalu pasang file kebutuhan Python:

```bash
python -m pip install -r requirements.txt
```

## 4. Menjalankan aplikasi

### Backend

Kalau baru pertama kali, jalankan ini dulu:

```bash
cd back-end
npm run setup-db
npm run dev
```

Kalau database sudah pernah disiapkan, cukup jalankan:

```bash
cd back-end
npm run dev
```

Backend akan dibuka di:

```bash
http://localhost:5000
```

### Frontend

Buka terminal baru, lalu jalankan:

```bash
cd frontend
npm run dev
```

Frontend biasanya dibuka di:

```bash
http://localhost:5173
```

### AI Service

Jalankan bagian AI dengan perintah ini:

```bash
cd ai-service
.venv\\Scripts\\activate
python app.py
```

Bagian AI ini biasanya berjalan di port 8001.

## 5. Urutan yang disarankan

1. Pasang kebutuhan backend, frontend, dan ai-service
2. Jalankan backend
3. Jalankan ai-service kalau fitur AI dipakai
4. Jalankan frontend
5. Buka frontend di browser

## 6. Saat dikirim ke teman atau deploy

Kalau kamu mau panduan deploy yang lebih lengkap, lihat [DEPLOYMENT.md](DEPLOYMENT.md).

Yang perlu dibagikan:

- kode project
- `requirements.txt` untuk Python
- `package.json` untuk Node.js
- file pengaturan yang memang dibutuhkan

Yang tidak perlu dibagikan:

- folder `.venv`
- `node_modules`

Folder itu tidak perlu ikut dikirim karena nanti dibuat ulang di komputer masing-masing lewat langkah di atas.

## 7. Ringkasan cepat

Kalau mau mulai dari awal, ikuti urutan ini:

```bash
cd back-end
npm install
npm run setup-db
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

```bash
cd ai-service
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install -r requirements.txt
python app.py
```

