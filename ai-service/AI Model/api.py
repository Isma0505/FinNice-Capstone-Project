import os
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai

# Import custom objects so Keras can deserialize them
from ai_model import CustomDense, FocalLoss
from inference import load_inference_pipeline, predict_transaction

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="FinNice AI API",
    description="Layanan REST API untuk klasifikasi transaksi (TensorFlow) dan saran keuangan pintar (Gemini AI) pada aplikasi FinNice.",
    version="1.0.0"
)

# Load model and scaler globally
try:
    model, scaler = load_inference_pipeline()
    print("Inference pipeline successfully loaded.")
except Exception as e:
    print(f"Warning: Gagal memuat model/scaler. Pastikan train.py sudah dijalankan. Error: {e}")
    model, scaler = None, None

# Initialize Gemini AI
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    print("Google Gemini API successfully configured.")
else:
    print("Warning: GEMINI_API_KEY tidak ditemukan di file .env. Fitur saran keuangan akan menggunakan mode simulasi.")

# Define schemas
class TransactionInput(BaseModel):
    amount: float = Field(..., example=25000.0)
    year: int = Field(..., example=2024)
    month: int = Field(..., example=8)
    day: int = Field(..., example=11)
    category_Bills_Fees: bool = Field(False, alias="category_Bills & Fees")
    category_Food_Drinks: bool = Field(False, alias="category_Food & Drinks")
    category_Transport: bool = Field(False, alias="category_Transport")
    account_Cash: bool = Field(False)
    account_Metro_Card: bool = Field(False, alias="account_Metro Card")
    account_Salary_Bank: bool = Field(False, alias="account_Salary Bank")
    account_Savings_Bank: bool = Field(False, alias="account_Savings Bank")
    type_EXPENSE: bool = Field(False)
    type_INCOME: bool = Field(False)
    type_TRANSFER: bool = Field(False)

    class Config:
        populate_by_name = True

class RecommendationInput(BaseModel):
    monthly_income: float = Field(..., example=5000000.0, description="Total pendapatan bulanan pengguna")
    monthly_expense: float = Field(..., example=4200000.0, description="Total pengeluaran bulanan pengguna")
    anomalous_transactions: list = Field(default=[], example=[{"amount": 850000.0, "category": "Transport", "description": "Taxi mewah"}], description="Daftar transaksi yang terdeteksi anomali oleh model AI")

@app.get("/")
def home():
    return {
        "status": "online",
        "app_name": "FinNice AI Service",
        "model_loaded": model is not None,
        "gemini_active": gemini_api_key is not None
    }

@app.post("/predict")
def predict(tx: TransactionInput):
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model atau Scaler belum dimuat di server. Hubungi administrator.")
    
    # Convert pydantic object to dict using aliases
    tx_dict = tx.model_dump(by_alias=True)
    
    try:
        res = predict_transaction(tx_dict, model, scaler)
        return {
            "success": True,
            "data": res
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Terjadi kesalahan saat melakukan prediksi: {e}")

@app.post("/recommend")
def recommend(info: RecommendationInput):
    # Buat prompt yang detail untuk Gemini AI
    prompt = f"""
    Anda adalah penasihat keuangan pribadi (financial advisor) yang ramah untuk mahasiswa/Gen-Z.
    Berikut adalah ringkasan keuangan pengguna bulan ini:
    - Pendapatan Bulanan: Rp {info.monthly_income:,.2f}
    - Total Pengeluaran: Rp {info.monthly_expense:,.2f}
    - Rasio Pengeluaran dibanding Pendapatan: {(info.monthly_expense / info.monthly_income) * 100:.1f}%
    """
    
    if info.anomalous_transactions:
        prompt += "\nTransaksi yang tidak wajar (anomali) bulan ini:\n"
        for idx, tx in enumerate(info.anomalous_transactions):
            prompt += f"{idx+1}. Kategori: {tx.get('category')}, Jumlah: Rp {tx.get('amount'):,.2f}\n"
    else:
        prompt += "\nTidak ada pengeluaran tidak wajar yang terdeteksi bulan ini. Bagus!\n"
        
    prompt += """
    Berdasarkan data di atas, berikan evaluasi keuangan yang ringkas dan 3 saran taktis dalam bahasa Indonesia yang gaul, suportif, dan mudah dipahami Gen-Z agar mereka bisa menghemat uang dan berinvestasi.
    Batasi saran maksimal 150 kata secara keseluruhan.
    """
    
    # Jika api key tersedia, panggil Gemini
    if gemini_api_key:
        try:
            gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            response = gemini_model.generate_content(prompt)
            recommendation_text = response.text.strip()
            return {
                "success": True,
                "recommendation": recommendation_text,
                "mode": "live"
            }
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            # Fallback to simulation if call fails
            pass
            
    # Simulation / Fallback Mode (jika API Key tidak ada atau error)
    ratio = info.monthly_expense / info.monthly_income
    if ratio > 0.8:
        advice = (
            "⚠️ Dompet kamu lagi kritis nih! Pengeluaran kamu udah nembus 80% dari pemasukan. "
            "Yuk kurangi nongkrong mahal dulu. Coba alokasikan 50% kebutuhan, 30% keinginan, dan 20% tabungan. "
            "Selain itu, ada anomali belanjaan besar yang terdeteksi, lain kali yuk dipikir ulang sebelum checkout!"
        )
    elif info.anomalous_transactions:
        advice = (
            "🙌 Pengeluaran kamu sebenarnya masih cukup aman, tapi ada transaksi mencurigakan yang jumlahnya gede banget. "
            "Coba check lagi, apakah itu kebutuhan darurat atau cuma impulsive buying pas ngeliat diskon? "
            "Mulai biasain buat nunda beli barang non-esensial selama 24 jam ya!"
        )
    else:
        advice = (
            "🔥 Keren banget! Manajemen keuangan kamu udah mantap bulan ini. "
            "Rasio pengeluaran terjaga dengan baik dan gak ada impulsive buying terdeteksi. "
            "Sekarang saatnya kamu sisihkan sisa uang tabungan kamu buat didepositokan atau investasi di reksa dana biar uangnya kerja keras buat kamu!"
        )
        
    return {
        "success": True,
        "recommendation": advice,
        "mode": "simulation"
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
