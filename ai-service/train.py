import os
import datetime
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Import custom components from ai_model.py
from ai_model import create_model, FocalLoss, StopAtTargetMetricsCallback

def main():
    print("=== Memulai Prapemrosesan Data ===")
    
    # 1. Memuat dataset
    data_path = 'Financial_Transactions_Cluster.csv'
    if not os.path.exists(data_path):
        print(f"Error: file {data_path} tidak ditemukan. Silakan jalankan script clustering terlebih dahulu.")
        return
        
    df = pd.read_csv(data_path)
    
    # Drop kolom year_month jika ada
    if 'year_month' in df.columns:
        df = df.drop('year_month', axis=1)
        
    # Memisahkan fitur dan target
    X = df.drop('Cluster', axis=1).copy()
    y = df['Cluster'].values.astype(np.float32)
    
    # Konversi kolom boolean/object ke float32 agar bisa dibaca TensorFlow
    for col in X.columns:
        if X[col].dtype == bool:
            X[col] = X[col].astype(np.float32)
            
    # Simpan nama-nama fitur untuk referensi di API
    feature_names = list(X.columns)
    print(f"Fitur yang digunakan ({len(feature_names)}): {feature_names}")
    
    # 2. Split data menjadi Train dan Test (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 3. Standardisasi semua fitur
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train).astype(np.float32)
    X_test_scaled = scaler.transform(X_test).astype(np.float32)
    
    # Simpan scaler untuk digunakan pada inference REST API
    joblib.dump(scaler, 'scaler.pkl')
    print("Scaler berhasil disimpan ke 'scaler.pkl'")
    
    # 4. Membuat TensorFlow Dataset
    batch_size = 32
    train_dataset = tf.data.Dataset.from_tensor_slices((X_train_scaled, y_train))
    train_dataset = train_dataset.shuffle(buffer_size=1024).batch(batch_size)
    
    test_dataset = tf.data.Dataset.from_tensor_slices((X_test_scaled, y_test))
    test_dataset = test_dataset.batch(batch_size)
    
    # 5. Inisialisasi Model, Loss, Optimizer, dan Metrics
    input_dim = X_train_scaled.shape[1]
    model = create_model(input_dim)
    model.stop_training = False # Inisialisasi untuk custom training loop
    model.summary()
    
    # Gunakan Custom Focal Loss
    loss_fn = FocalLoss(alpha=0.25, gamma=2.0)
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    
    # Metrik Evaluasi
    train_loss = tf.keras.metrics.Mean(name='train_loss')
    train_accuracy = tf.keras.metrics.BinaryAccuracy(name='train_accuracy')
    train_mae = tf.keras.metrics.MeanAbsoluteError(name='train_mae')
    
    test_loss = tf.keras.metrics.Mean(name='test_loss')
    test_accuracy = tf.keras.metrics.BinaryAccuracy(name='test_accuracy')
    test_mae = tf.keras.metrics.MeanAbsoluteError(name='test_mae')
    
    # 6. TensorBoard Logger
    log_dir = os.path.join("logs", "fit", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
    summary_writer = tf.summary.create_file_writer(log_dir)
    print(f"Log TensorBoard akan disimpan di: {log_dir}")
    
    # Inisialisasi Custom Callback
    callback = StopAtTargetMetricsCallback(target_accuracy=0.85, target_mae=0.02)
    callback.set_model(model)
    
    # 7. Custom Training Loop menggunakan tf.GradientTape
    @tf.function
    def train_step(x, y):
        with tf.GradientTape() as tape:
            # Forward pass
            predictions = model(x, training=True)
            # Squeeze output jika shape (batch, 1) agar sama dengan target (batch,)
            predictions_squeezed = tf.squeeze(predictions, axis=-1)
            loss = loss_fn(y, predictions_squeezed)
            
        # Hitung gradients
        gradients = tape.gradient(loss, model.trainable_variables)
        # Update bobot
        optimizer.apply_gradients(zip(gradients, model.trainable_variables))
        
        # Update metrik
        train_loss(loss)
        train_accuracy(y, predictions_squeezed)
        train_mae(y, predictions_squeezed)
        
    @tf.function
    def test_step(x, y):
        # Forward pass tanpa menghitung gradien
        predictions = model(x, training=False)
        predictions_squeezed = tf.squeeze(predictions, axis=-1)
        t_loss = loss_fn(y, predictions_squeezed)
        
        # Update metrik test
        test_loss(t_loss)
        test_accuracy(y, predictions_squeezed)
        test_mae(y, predictions_squeezed)

    epochs = 100
    print("\n=== Memulai Custom Training Loop ===")
    
    for epoch in range(epochs):
        # Reset metrik di setiap awal epoch
        train_loss.reset_state()
        train_accuracy.reset_state()
        train_mae.reset_state()
        test_loss.reset_state()
        test_accuracy.reset_state()
        test_mae.reset_state()
        
        # Loop training batch
        for step, (x_batch_train, y_batch_train) in enumerate(train_dataset):
            train_step(x_batch_train, y_batch_train)
            
        # Loop test batch
        for x_batch_test, y_batch_test in test_dataset:
            test_step(x_batch_test, y_batch_test)
            
        # Tulis metrik ke TensorBoard
        with summary_writer.as_default():
            tf.summary.scalar('loss/train', train_loss.result(), step=epoch)
            tf.summary.scalar('accuracy/train', train_accuracy.result(), step=epoch)
            tf.summary.scalar('mae/train', train_mae.result(), step=epoch)
            tf.summary.scalar('loss/val', test_loss.result(), step=epoch)
            tf.summary.scalar('accuracy/val', test_accuracy.result(), step=epoch)
            tf.summary.scalar('mae/val', test_mae.result(), step=epoch)
            
        # Tampilkan progress epoch
        print(f"Epoch {epoch+1:02d}/{epochs:02d} - "
              f"Loss: {train_loss.result().numpy():.4f} - "
              f"Acc: {train_accuracy.result().numpy():.4f} - "
              f"MAE: {train_mae.result().numpy():.4f} | "
              f"Val Loss: {test_loss.result().numpy():.4f} - "
              f"Val Acc: {test_accuracy.result().numpy():.4f} - "
              f"Val MAE: {test_mae.result().numpy():.4f}")
              
        # Jalankan Custom Callback
        epoch_logs = {
            "accuracy": train_accuracy.result().numpy(),
            "mae": train_mae.result().numpy(),
            "val_accuracy": test_accuracy.result().numpy(),
            "val_mae": test_mae.result().numpy(),
        }
        
        callback.on_epoch_end(epoch, logs=epoch_logs)
        if model.stop_training:
            break
            
    # 8. Menyimpan model akhir
    model_save_path = 'model_finnice.keras'
    model.save(model_save_path)
    print(f"\nModel berhasil dilatih dan disimpan di '{model_save_path}'")

if __name__ == '__main__':
    main()
