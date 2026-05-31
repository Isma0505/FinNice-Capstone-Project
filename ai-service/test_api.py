from fastapi.testclient import TestClient

# Import the FastAPI app
from api import app

client = TestClient(app)

def test_root_endpoint():
    print("Menguji endpoint / ...")
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    print("Endpoint / BERHASIL diuji.")

def test_predict_normal_transaction():
    print("Menguji endpoint /predict untuk transaksi normal...")
    payload = {
        "amount": 25000.0,
        "year": 2024,
        "month": 8,
        "day": 28,
        "category_Food & Drinks": True,
        "account_Cash": True,
        "type_EXPENSE": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "anomaly_score" in res_data["data"]
    assert res_data["data"]["is_anomaly"] is False
    assert res_data["data"]["label"] == "NORMAL"
    print(f"Hasil Uji Transaksi Normal: {res_data['data']['label']} (Score: {res_data['data']['anomaly_score']:.4f})")

def test_predict_anomaly_transaction():
    print("Menguji endpoint /predict untuk transaksi anomali...")
    # Dalam KMeans yang baru, large amounts or transport/metro card are partitioned differently
    # Let's test a category Bills & Fees on Savings Bank which belongs to Cluster 0 (NORMAL)
    # And Food & Drinks on Cash which belongs to Cluster 1 (ANOMALI in our label config, i.e., score >= 0.5)
    
    # Test case matching Cluster 1 (anomaly_score >= 0.5)
    payload_cluster1 = {
        "amount": 35000.0,
        "year": 2024,
        "month": 8,
        "day": 1,
        "category_Food & Drinks": True,
        "account_Cash": True,
        "type_EXPENSE": True
    }
    response = client.post("/predict", json=payload_cluster1)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["is_anomaly"] is True
    assert res_data["data"]["label"] == "ANOMALI (Pengeluaran Tidak Wajar)"
    print(f"Hasil Uji Transaksi Anomali: {res_data['data']['label']} (Score: {res_data['data']['anomaly_score']:.4f})")

def test_recommend_endpoint():
    print("Menguji endpoint /recommend...")
    payload = {
        "monthly_income": 5000000.0,
        "monthly_expense": 4500000.0,
        "anomalous_transactions": [
            {"amount": 850000.0, "category": "Transport", "description": "Taxi mewah"}
        ]
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "recommendation" in res_data
    print("Rekomendasi Keuangan yang Dihasilkan:")
    import sys
    recommendation_text = res_data["recommendation"]
    try:
        print(recommendation_text)
    except UnicodeEncodeError:
        if sys.stdout and sys.stdout.encoding:
            print(recommendation_text.encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding, errors='replace'))
        else:
            print(recommendation_text.encode('utf-8', errors='ignore').decode('utf-8', errors='ignore'))
    print(f"Mode running: {res_data['mode']}")

if __name__ == "__main__":
    print("=== Memulai Pengujian API FinNice ===")
    test_root_endpoint()
    test_predict_normal_transaction()
    test_predict_anomaly_transaction()
    test_recommend_endpoint()
    print("=== Seluruh Pengujian Selesai & BERHASIL ===")
