# FinNice AI Service

Layanan AI Service ini menyediakan REST API untuk aplikasi FinNice, yang mendukung deteksi transaksi tidak wajar (anomali) menggunakan **TensorFlow** & **Decision Tree**, serta memberikan saran keuangan pintar berbasis **Google Gemini AI**.

---

## 📂 Struktur Folder & Berkas

Berikut adalah penjelasan fungsi dari berkas-berkas utama di dalam folder `ai-service`:

*   **`api.py`**: Server API Utama (berjalan di port `8000`). Menggunakan model TensorFlow untuk klasifikasi anomali transaksi dan mengintegrasikan Google Gemini AI untuk memberikan saran keuangan.
*   **`app.py`**: Server API Fallback/Legacy (berjalan di port `8001`). Menggunakan model Decision Tree dan logika berbasis aturan (*rule-based*) untuk `/advice`.
*   **`ai_model.py`**: Deklarasi komponen kustom TensorFlow (`CustomDense`, `FocalLoss`) yang digunakan saat memuat model neural network Keras.
*   **`inference.py`**: Pipeline inference untuk preprocessing data (scaling data menggunakan `scaler.pkl`) dan menjalankan prediksi pada model TensorFlow.
*   **`train.py`**: Skrip untuk melatih ulang model neural network TensorFlow dan menyimpan model (`model_finnice.keras`) serta scaler (`scaler.pkl`).
*   **`test_api.py`**: Skrip unit testing untuk memastikan semua endpoint pada `api.py` berfungsi dengan benar.
*   **`requirements.txt`**: Daftar dependensi library Python yang dibutuhkan oleh project ini.
*   **`.env`**: File konfigurasi environment variables (digunakan untuk menyimpan `GEMINI_API_KEY`).

---

## 🛠️ Persiapan Lingkungan (Setup)

1.  **Masuk ke folder `ai-service`**:
    ```bash
    cd ai-service
    ```

2.  **Buat Virtual Environment (Venv)**:
    ```bash
    python -m venv .venv
    ```

3.  **Aktifkan Virtual Environment**:
    *   **Windows (PowerShell)**:
        ```powershell
        .venv\Scripts\Activate.ps1
        ```
    *   **Windows (CMD)**:
        ```cmd
        .venv\Scripts\activate.bat
        ```
    *   **macOS / Linux**:
        ```bash
        source .venv/bin/activate
        ```

4.  **Install Dependensi**:
    ```bash
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    ```

5.  **Konfigurasi Environment (`.env`)**:
    Buat berkas bernama `.env` di dalam folder ini dan tambahkan API Key Gemini Anda jika ingin mengaktifkan fitur saran finansial berbasis AI yang interaktif:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Catatan: Jika `GEMINI_API_KEY` tidak diisi, server akan otomatis masuk ke **mode simulasi/fallback**.*

---

## 🚀 Cara Menjalankan Layanan

### 1. Jalankan API Utama (TensorFlow & Gemini)
Layanan ini berjalan di port **8000**:
```bash
python api.py
```
atau menggunakan uvicorn langsung:
```bash
uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

**Endpoint Utama (`api.py`):**
*   `GET /`: Informasi status server.
*   `POST /predict`: Klasifikasi anomali transaksi.
*   `POST /recommend`: Rekomendasi keuangan personal gaya Gen-Z (terintegrasi Gemini AI).

---

### 2. Jalankan API Fallback (Decision Tree & Rule-Based)
Layanan ini berjalan di port **8001** (digunakan secara langsung oleh server backend FinNice):
```bash
python app.py
```

**Endpoint Utama (`app.py`):**
*   `GET /health`: Cek kesehatan server.
*   `GET /metadata`: Informasi metadata model Decision Tree.
*   `POST /predict`: Prediksi anomali transaksi menggunakan Decision Tree.
*   `POST /advice`: Saran keuangan berbasis aturan anggaran dan transaksi.

#### 🔄 Menjalankan di Port Berbeda
Jika port `8001` (atau port lainnya) sudah digunakan oleh aplikasi lain, Anda dapat menjalankan layanan ini di port alternatif dengan mengatur *environment variable* `AI_SERVICE_PORT` atau `PORT` sebelum menjalankan aplikasi:

**Windows (PowerShell):**
```powershell
$env:AI_SERVICE_PORT = '8002'
python app.py
```

**Linux / macOS:**
```bash
AI_SERVICE_PORT=8002 python app.py
```

Anda juga dapat mengatur host secara kustom dengan *environment variable* `AI_SERVICE_HOST` jika diperlukan.

---

## 🧪 Pengujian & Pelatihan Ulang

*   **Menjalankan Unit Test**:
    Untuk memastikan endpoints bekerja dengan baik, jalankan perintah berikut (pastikan virtual environment aktif):
    ```bash
    python test_api.py
    ```

*   **Melatih Ulang Model**:
    Jika Anda ingin melakukan training ulang terhadap dataset transaksi keuangan untuk mendeteksi anomali:
    ```bash
    python train.py
    ```
