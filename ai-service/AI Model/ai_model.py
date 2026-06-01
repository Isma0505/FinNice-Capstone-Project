import tensorflow as tf
from tensorflow.keras import layers, models

# 1. Custom Layer Subclassing
@tf.keras.utils.register_keras_serializable(package="custom_layers")
class CustomDense(layers.Layer):
    """
    Kustom Dense Layer dengan bobot (weights) dan bias yang didefinisikan secara manual
    untuk memenuhi kriteria Model Subclassing / Custom Layer.
    """
    def __init__(self, units, activation=None, **kwargs):
        super(CustomDense, self).__init__(**kwargs)
        self.units = units
        self.activation_name = activation
        self.activation = tf.keras.activations.get(activation)

    def build(self, input_shape):
        # Definisikan bobot secara manual
        self.w = self.add_weight(
            name="weight",
            shape=(input_shape[-1], self.units),
            initializer="glorot_uniform",
            trainable=True,
        )
        # Definisikan bias secara manual
        self.b = self.add_weight(
            name="bias",
            shape=(self.units,),
            initializer="zeros",
            trainable=True,
        )
        super(CustomDense, self).build(input_shape)

    def call(self, inputs):
        # Operasi matmul dan penjumlahan bias
        x = tf.matmul(inputs, self.w) + self.b
        if self.activation is not None:
            x = self.activation(x)
        return x

    def get_config(self):
        config = super(CustomDense, self).get_config()
        config.update({
            "units": self.units,
            "activation": self.activation_name,
        })
        return config


# 2. Custom Loss Function (Focal Loss)
@tf.keras.utils.register_keras_serializable(package="custom_losses")
class FocalLoss(tf.keras.losses.Loss):
    """
    Focal Loss kustom untuk menangani ketidakseimbangan kelas pada deteksi anomali.
    Meningkatkan bobot kerugian untuk kelas minoritas yang sulit diklasifikasikan.
    """
    def __init__(self, alpha=0.25, gamma=2.0, **kwargs):
        super(FocalLoss, self).__init__(**kwargs)
        self.alpha = alpha
        self.gamma = gamma

    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        # Menghindari pembagian dengan nol atau nilai log tak terdefinisi
        y_pred = tf.clip_by_value(y_pred, tf.keras.backend.epsilon(), 1.0 - tf.keras.backend.epsilon())
        
        # Hitung Binary Cross Entropy
        bce = -y_true * tf.math.log(y_pred) - (1.0 - y_true) * tf.math.log(1.0 - y_pred)
        
        # Hitung faktor pengali Focal Loss
        p_t = y_true * y_pred + (1.0 - y_true) * (1.0 - y_pred)
        focal_weight = tf.pow(1.0 - p_t, self.gamma)
        
        loss = self.alpha * focal_weight * bce
        return tf.reduce_mean(loss, axis=-1)

    def get_config(self):
        config = super(FocalLoss, self).get_config()
        config.update({
            "alpha": self.alpha,
            "gamma": self.gamma,
        })
        return config


# 3. Custom Callback untuk Target Performa
class StopAtTargetMetricsCallback(tf.keras.callbacks.Callback):
    """
    Callback kustom untuk menghentikan pelatihan model ketika target performa
    telah terpenuhi (Akurasi >= 85% dan MAE <= 0.02).
    """
    def __init__(self, target_accuracy=0.85, target_mae=0.02):
        super(StopAtTargetMetricsCallback, self).__init__()
        self.target_accuracy = target_accuracy
        self.target_mae = target_mae

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        # Membaca metrik dari riwayat training
        val_acc = logs.get("val_accuracy") or logs.get("accuracy")
        val_mae = logs.get("val_mae") or logs.get("mae")
        
        if val_acc is not None and val_mae is not None:
            if val_acc >= self.target_accuracy and val_mae <= self.target_mae:
                print(f"\n[Callback] Pelatihan dihentikan otomatis pada epoch {epoch+1}!")
                print(f"-> Target Terpenuhi: Akurasi = {val_acc:.4f} (>= {self.target_accuracy}), MAE = {val_mae:.4f} (<= {self.target_mae})")
                self.model.stop_training = True


# 4. Model Creation using TensorFlow Functional API
def create_model(input_dim):
    """
    Membangun model menggunakan TensorFlow Functional API dengan integrasi Custom Layer.
    """
    inputs = layers.Input(shape=(input_dim,), name="input_layer")
    
    # Hidden Layer 1 menggunakan Custom Layer
    x = CustomDense(64, activation="relu", name="custom_dense_1")(inputs)
    x = layers.Dropout(0.2, name="dropout_1")(x)
    
    # Hidden Layer 2 menggunakan Custom Layer
    x = CustomDense(32, activation="relu", name="custom_dense_2")(x)
    x = layers.Dropout(0.1, name="dropout_2")(x)
    
    # Output Layer (untuk klasifikasi biner)
    outputs = layers.Dense(1, activation="sigmoid", name="output_layer")(x)
    
    model = models.Model(inputs=inputs, outputs=outputs, name="FinNice_DL_Classifier")
    return model
