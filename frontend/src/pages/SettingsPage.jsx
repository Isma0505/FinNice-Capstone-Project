import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import Cropper from 'react-easy-crop';
import { saveData, setActiveUserData } from '../utils/api';

const PROTECTED_EMAIL = 'finnice@gmail.com';

// Daftar avatar default (icon)
const avatarOptions = [
  { id: 'avatar1', icon: 'fa-user-circle', color: '#00e6b8', bg: 'var(--accent-dim)', type: 'icon' },
  { id: 'avatar2', icon: 'fa-cat', color: '#ffb347', bg: 'rgba(255, 179, 71, 0.15)', type: 'icon' },
  { id: 'avatar3', icon: 'fa-dog', color: '#ff7b8a', bg: 'rgba(255, 123, 138, 0.15)', type: 'icon' },
  { id: 'avatar4', icon: 'fa-otter', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', type: 'icon' },
  { id: 'avatar5', icon: 'fa-dragon', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', type: 'icon' },
  { id: 'avatar6', icon: 'fa-frog', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', type: 'icon' },
  { id: 'avatar7', icon: 'fa-kiwi-bird', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', type: 'icon' },
  { id: 'avatar8', icon: 'fa-hippo', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)', type: 'icon' },
];

function SettingsPage() {
  const { locale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  // State untuk crop
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finnice_user');
    return saved ? JSON.parse(saved) : { name: '', email: '' };
  });
  
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('finnice_avatar') || 'avatar1';
  });
  
  const [customAvatar, setCustomAvatar] = useState(() => {
    return localStorage.getItem('finnice_custom_avatar') || null;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pilih avatar default (icon)
  const handleAvatarChange = (avatarId) => {
    setSelectedAvatar(avatarId);
    setCustomAvatar(null);
    localStorage.setItem('finnice_avatar', avatarId);
    localStorage.removeItem('finnice_custom_avatar');
    window.dispatchEvent(new Event('avatarChanged'));
  };

  // Upload foto - buka cropper dulu
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // Fungsi crop selesai
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Generate hasil crop
  const createCroppedImage = async () => {
    if (!croppedAreaPixels) {
      alert(locale === 'id' ? 'Silakan crop gambar terlebih dahulu' : 'Please crop the image first');
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });
      
      const ctx = canvas.getContext('2d');
      const { width, height, x, y } = croppedAreaPixels;
      
      canvas.width = 200;
      canvas.height = 200;
      
      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        200,
        200
      );
      
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      
      // Simpan hasil crop
      setCustomAvatar(croppedImage);
      setSelectedAvatar(null);
      localStorage.setItem('finnice_custom_avatar', croppedImage);
      localStorage.removeItem('finnice_avatar');
      window.dispatchEvent(new Event('avatarChanged'));
      
      // Tutup cropper
      setShowCropper(false);
      setImageSrc(null);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      alert(locale === 'id' ? 'Gagal memotong gambar' : 'Failed to crop image');
    }
  };

  // Hapus foto custom, balik ke avatar default
  const removeCustomAvatar = () => {
    setCustomAvatar(null);
    setSelectedAvatar('avatar1');
    localStorage.setItem('finnice_avatar', 'avatar1');
    localStorage.removeItem('finnice_custom_avatar');
    window.dispatchEvent(new Event('avatarChanged'));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem('finnice_user', JSON.stringify(updatedUser));
    
    setActiveUserData(updatedUser);
    const activeDataKey = localStorage.getItem('finnice_data');
    const currentData = activeDataKey ? JSON.parse(localStorage.getItem(activeDataKey) || 'null') : null;
    if (currentData) {
      currentData.user = updatedUser;
      saveData(currentData);
    }

    window.dispatchEvent(new Event('userChanged'));
    
    setIsEditing(false);
    alert(locale === 'id' ? 'Profil berhasil diupdate!' : 'Profile updated!');
  };

  const handleResetData = () => {
    if (window.confirm(locale === 'id' ? 'Yakin ingin mereset semua data? Tindakan ini tidak bisa dibatalkan!' : 'Reset all data? This cannot be undone!')) {
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('finnice_user') || 'null');
        } catch {
          return null;
        }
      })();
      const activeDataKey = localStorage.getItem('finnice_data');
      if (activeDataKey && currentUser?.email !== PROTECTED_EMAIL) {
        localStorage.removeItem(activeDataKey);
      }
      localStorage.removeItem('finnice_data');
      localStorage.removeItem('finnice_user');
      localStorage.removeItem('finnice_avatar');
      localStorage.removeItem('finnice_custom_avatar');
      alert(
        currentUser?.email === PROTECTED_EMAIL
          ? (locale === 'id' ? 'Data akun ini dilindungi dan tidak dihapus.' : 'This account data is protected and was not deleted.')
          : (locale === 'id' ? 'Data telah direset. Silakan login kembali.' : 'Data reset. Please login again.')
      );
      window.location.href = '/login';
    }
  };

  // Tampilkan avatar yang aktif (custom atau default)
  const getCurrentAvatar = () => {
    if (customAvatar) {
      return { type: 'custom', src: customAvatar };
    }
    const defaultAvatar = avatarOptions.find(a => a.id === selectedAvatar) || avatarOptions[0];
    return { type: 'icon', ...defaultAvatar };
  };

  const currentAvatar = getCurrentAvatar();

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>{locale === 'id' ? 'Pengaturan' : 'Settings'}</h2>

      {/* Avatar Section */}
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {locale === 'id' ? 'Avatar Profil' : 'Profile Avatar'}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Preview Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: currentAvatar.type === 'icon' ? currentAvatar.bg : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            color: currentAvatar.type === 'icon' ? currentAvatar.color : 'transparent',
            border: '2px solid var(--accent)',
            overflow: 'hidden'
          }}>
            {currentAvatar.type === 'custom' ? (
              <img src={currentAvatar.src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className={`fa-solid ${currentAvatar.icon}`}></i>
            )}
          </div>
          
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {locale === 'id' ? 'Pilih avatar atau upload foto sendiri' : 'Choose avatar or upload your own photo'}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="btn-secondary" 
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '6px 16px', fontSize: '13px' }}
              >
                <i className="fa-solid fa-upload" style={{ marginRight: '6px' }}></i>
                {locale === 'id' ? 'Upload Foto' : 'Upload Photo'}
              </button>
              
              {customAvatar && (
                <button 
                  className="btn-secondary" 
                  onClick={removeCustomAvatar}
                  style={{ padding: '6px 16px', fontSize: '13px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                >
                  <i className="fa-solid fa-trash"></i> {locale === 'id' ? 'Hapus Foto' : 'Remove Photo'}
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Avatar Default (icon) */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {locale === 'id' ? 'Atau pilih avatar default:' : 'Or choose default avatar:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px' }}>
            {avatarOptions.map(avatar => (
              <div
                key={avatar.id}
                onClick={() => handleAvatarChange(avatar.id)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: avatar.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  color: avatar.color,
                  cursor: 'pointer',
                  border: (!customAvatar && selectedAvatar === avatar.id) ? `2px solid var(--accent)` : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <i className={`fa-solid ${avatar.icon}`}></i>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Cropper - Versi Pendek Tanpa Scroll */}
      {showCropper && (
        <div className="modal-overlay" onClick={() => setShowCropper(false)}>
          <div className="modal-container" style={{ maxWidth: '450px', maxHeight: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{locale === 'id' ? 'Crop Foto' : 'Crop Photo'}</h3>
              <button className="modal-close" onClick={() => setShowCropper(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              {/* Cropper area - ukuran lebih kecil */}
              <div style={{ position: 'relative', width: '100%', height: '250px', marginBottom: '12px', background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              {/* Zoom slider */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  🔍 {locale === 'id' ? 'Zoom' : 'Zoom'}
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
              
              {/* Tombol - PASTIKAN INI ADA */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowCropper(false);
                    setImageSrc(null);
                  }} 
                  style={{ flex: 1, padding: '10px' }}
                >
                  {locale === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={createCroppedImage} 
                  style={{ flex: 1, padding: '10px' }}
                >
                  ✓ {locale === 'id' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profil - edit nama & email */}
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {locale === 'id' ? 'Profil' : 'Profile'}
        </h3>
        
        {!isEditing ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Name</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{user.name || '-'}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{user.email || '-'}</div>
            </div>
            <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ width: 'auto', padding: '8px 24px' }}>
              {locale === 'id' ? 'Edit Profil' : 'Edit Profile'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile}>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder={locale === 'id' ? 'Nama Lengkap' : 'Full Name'}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                {locale === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary">
                {locale === 'id' ? 'Simpan' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tema - Ganti jadi dua tombol pilihan */}
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {locale === 'id' ? 'Tampilan' : 'Appearance'}
        </h3>
        <div>
          <div style={{ fontWeight: 500 }}>{locale === 'id' ? 'Mode Tampilan' : 'Display Mode'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {locale === 'id' ? 'Pilih tema gelap atau terang' : 'Choose dark or light theme'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={theme === 'dark' ? 'btn-primary' : 'btn-secondary'} 
              onClick={() => {
                localStorage.setItem('theme', 'dark');
                window.location.reload();
              }}
              style={{ width: 'auto', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-moon"></i>
              {locale === 'id' ? 'Gelap' : 'Dark'}
            </button>
            <button 
              className={theme === 'light' ? 'btn-primary' : 'btn-secondary'} 
              onClick={() => {
                localStorage.setItem('theme', 'light');
                window.location.reload();
              }}
              style={{ width: 'auto', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-sun"></i>
              {locale === 'id' ? 'Terang' : 'Light'}
            </button>
          </div>
        </div>
      </div>

      {/* Bahasa */}
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {locale === 'id' ? 'Bahasa' : 'Language'}
        </h3>
        <div>
          <div style={{ fontWeight: 500 }}>{locale === 'id' ? 'Pilih Bahasa' : 'Select Language'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {locale === 'id' ? 'Ganti bahasa antarmuka' : 'Change interface language'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={locale === 'id' ? 'btn-primary' : 'btn-secondary'} 
              onClick={() => {
                localStorage.setItem('locale', 'id');
                window.location.reload();
              }}
              style={{ width: 'auto', padding: '8px 24px' }}
            >
              Indonesia
            </button>
            <button 
              className={locale === 'en' ? 'btn-primary' : 'btn-secondary'} 
              onClick={() => {
                localStorage.setItem('locale', 'en');
                window.location.reload();
              }}
              style={{ width: 'auto', padding: '8px 24px' }}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Data & Keamanan */}
      <div className="stat-card" style={{ marginBottom: '24px', borderColor: 'var(--danger)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--danger)' }}>
          {locale === 'id' ? 'Data & Keamanan' : 'Data & Security'}
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 500 }}>{locale === 'id' ? 'Reset Semua Data' : 'Reset All Data'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {locale === 'id' ? 'Hapus semua transaksi, budget, dan akun' : 'Delete all transactions, budgets, and accounts'}
          </div>
          <button className="btn-secondary" onClick={handleResetData} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            {locale === 'id' ? 'Reset Data' : 'Reset Data'}
          </button>
        </div>
      </div>

      {/* Tentang */}
      <div className="stat-card">
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {locale === 'id' ? 'Tentang' : 'About'}
        </h3>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          FinNice - Personal Finance Manager
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;