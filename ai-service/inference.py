import os
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib

# Import custom objects so Keras can deserialize them
from ai_model import CustomDense, FocalLoss

def load_inference_pipeline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'model_finnice.keras')
    scaler_path = os.path.join(base_dir, 'scaler.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise FileNotFoundError("Model (.keras) atau Scaler (.pkl) tidak ditemukan. Jalankan train.py terlebih dahulu.")
        
    # Load model dengan custom objects
    model = tf.keras.models.load_model(
        model_path,
        custom_objects={
            'CustomDense': CustomDense,
            'FocalLoss': FocalLoss
        }
    )
    
    # Load scaler
    scaler = joblib.load(scaler_path)
    
    return model, scaler

def predict_transaction(transaction_data, model, scaler):
    """
    Memprediksi apakah suatu transaksi termasuk anomali.
    transaction_data: dictionary berisi data transaksi mentah
    """
    # Kolom fitur sesuai dengan urutan latihan model
    feature_order = [
        'amount', 'year', 'month', 'day',
        'category_Bills & Fees', 'category_Food & Drinks', 'category_Transport',
        'account_Cash', 'account_Metro Card', 'account_Salary Bank', 'account_Savings Bank',
        'type_EXPENSE', 'type_INCOME', 'type_TRANSFER'
    ]
    
    # Konversi input ke DataFrame
    df = pd.DataFrame([transaction_data])
    
    # Isi kolom boolean yang absen dengan False
    for col in feature_order:
        if col not in df.columns:
            if col.startswith('category_') or col.startswith('account_') or col.startswith('type_'):
                df[col] = False
            else:
                df[col] = 0
                
    # Susun sesuai urutan fitur
    df = df[feature_order].copy()
    
    # Konversi kolom boolean ke float32
    for col in df.columns:
        if df[col].dtype == bool or df[col].dtype == 'object':
            df[col] = df[col].astype(np.float32)
            
    # Standardisasi semua kolom menggunakan scaler yang dimuat
    scaled_values = scaler.transform(df).astype(np.float32)
    
    # Jalankan prediksi
    prediction = model.predict(scaled_values, verbose=0)
    score = float(prediction[0][0])
    
    # Ambil threshold 0.5 untuk menentukan anomali
    is_anomaly = score >= 0.5
    
    return {
        "anomaly_score": score,
        "is_anomaly": is_anomaly,
        "label": "ANOMALI (Pengeluaran Tidak Wajar)" if is_anomaly else "NORMAL"
    }

if __name__ == '__main__':
    print("=== Skrip Uji Inference Model ===")
    try:
        model, scaler = load_inference_pipeline()
        print("Model dan Scaler berhasil dimuat.")
        
        # Test case 1: Transaksi Normal (Pengeluaran makan kecil)
        sample_normal = {
            'amount': 25000.0,
            'year': 2026,
            'month': 5,
            'day': 27,
            'category_Food & Drinks': True,
            'account_Cash': True,
            'type_EXPENSE': True
        }
        
        # Test case 2: Transaksi berpotensi Anomali (Jumlah besar untuk transportasi)
        sample_anomaly = {
            'amount': 850000.0,
            'year': 2026,
            'month': 5,
            'day': 27,
            'category_Transport': True,
            'account_Metro Card': True,
            'type_EXPENSE': True
        }
        
        res_normal = predict_transaction(sample_normal, model, scaler)
        res_anomaly = predict_transaction(sample_anomaly, model, scaler)
        
        print("\n--- Test Case 1 (Makan Rp 25.000): ---")
        print(f"Hasil: {res_normal['label']} (Score: {res_normal['anomaly_score']:.4f})")
        
        print("\n--- Test Case 2 (Transport Rp 850.000): ---")
        print(f"Hasil: {res_anomaly['label']} (Score: {res_anomaly['anomaly_score']:.4f})")
        
    except Exception as e:
        print(f"Terjadi kesalahan: {e}")
