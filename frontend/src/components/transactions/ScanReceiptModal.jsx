import { useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from '../common/Modal';

function ScanReceiptModal({ isOpen, onClose, imageSrc, onScanComplete }) {
  const { locale } = useLocale();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Simulasi proses scan (nanti diganti panggil API AI)
  const handleScan = async () => {
    setScanning(true);
    
    // Simulasi loading 2 detik
    setTimeout(() => {
      // Hasil scan dummy (nanti dari backend + AI)
      const dummyResult = {
        success: true,
        data: {
          items: [
            { name: 'Indomie Goreng', price: 3500, category: 'Makanan' },
            { name: 'Teh Botol', price: 5000, category: 'Makanan' },
            { name: 'Bensin', price: 20000, category: 'Transportasi' },
            { name: 'Sabun Mandi', price: 12000, category: 'Belanja' },
          ],
          total: 40500,
          date: new Date().toISOString().split('T')[0],
          store: 'Indomaret',
        }
      };
      
      setScanResult(dummyResult.data);
      setScanning(false);
    }, 2000);
  };

  const handleConfirm = () => {
    if (scanResult) {
      onScanComplete(scanResult);
      onClose();
      setScanResult(null);
      setSelectedImage(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === 'id' ? 'Scan Struk Belanja' : 'Scan Receipt'}>
      {!scanResult ? (
        // Step 1: Preview gambar & tombol scan
        <div>
          {imageSrc && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img 
                src={imageSrc} 
                alt="receipt" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }} 
              />
            </div>
          )}
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {locale === 'id' 
              ? 'AI akan membaca struk dan mengisi transaksi secara otomatis' 
              : 'AI will read the receipt and auto-fill transactions'}
          </p>
          
          <button 
            className="btn-primary" 
            onClick={handleScan} 
            disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {scanning ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                {locale === 'id' ? 'Memproses...' : 'Processing...'}
              </>
            ) : (
              <>
                <i className="fa-solid fa-robot"></i>
                {locale === 'id' ? 'Scan dengan AI' : 'Scan with AI'}
              </>
            )}
          </button>
        </div>
      ) : (
        // Step 2: Hasil scan, user konfirmasi
        <div>
          <div style={{ 
            background: 'var(--accent-dim)', 
            borderRadius: '12px', 
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {locale === 'id' ? 'Toko' : 'Store'}
              </span>
              <span style={{ fontWeight: 500 }}>{scanResult.store}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {locale === 'id' ? 'Total' : 'Total'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--expense)' }}>
                -Rp {scanResult.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>
              {locale === 'id' ? 'Item yang terdeteksi:' : 'Detected items:'}
            </div>
            {scanResult.items.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '13px'
              }}>
                <span>{item.name}</span>
                <span style={{ color: 'var(--expense)' }}>Rp {item.price.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => {
              setScanResult(null);
              setScanning(false);
            }} style={{ flex: 1 }}>
              {locale === 'id' ? 'Scan Ulang' : 'Rescan'}
            </button>
            <button className="btn-primary" onClick={handleConfirm} style={{ flex: 1 }}>
              <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>
              {locale === 'id' ? 'Simpan Semua' : 'Save All'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ScanReceiptModal;