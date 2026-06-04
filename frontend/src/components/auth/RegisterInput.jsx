import { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import useInput from '../../hooks/useInput';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

function RegisterInput({ onRegister, loading }) {  // ← tambah loading prop
  const { locale } = useLocale();
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirmPassword, onConfirmPasswordChange] = useInput('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [pwStrength, setPwStrength] = useState(0);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError(locale === 'id' ? 'Semua field harus diisi!' : 'All fields are required!');
      return;
    }
    
    if (password !== confirmPassword) {
      setError(locale === 'id' ? 'Password dan konfirmasi tidak cocok!' : 'Password and confirm password do not match!');
      return;
    }
    
    if (password.length < 6) {
      setError(locale === 'id' ? 'Password minimal 6 karakter!' : 'Password must be at least 6 characters!');
      return;
    }

    if (!agreed) {
      setError(locale === 'id' ? 'Harap setujui syarat & ketentuan!' : 'Please agree to the terms and conditions!');
      return;
    }
    
    setError('');
    onRegister({ name, email, password });
  };

  useEffect(() => {
    const pw = password || '';
    const upper = /[A-Z]/.test(pw);
    const lower = /[a-z]/.test(pw);
    const number = /[0-9]/.test(pw);
    const symbol = /[^A-Za-z0-9]/.test(pw);
    setHasUpper(upper);
    setHasLower(lower);
    setHasNumber(number);
    setHasSymbol(symbol);

    let score = 0;
    if (pw.length >= 6) score += 1;
    if (upper) score += 1;
    if (lower) score += 1;
    if (number) score += 1;
    if (symbol) score += 1;

    setPwStrength(Math.min(100, Math.round((score / 5) * 100)));
  }, [password]);

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ 
          background: 'rgba(255, 92, 114, 0.15)', 
          border: '1px solid var(--danger)', 
          borderRadius: '8px', 
          padding: '10px', 
          marginBottom: '16px',
          color: 'var(--danger)',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}
      
      <div className="input-group">
        <FaUser className="icon-left" />
        <input
          type="text"
          placeholder={locale === 'id' ? 'Nama Lengkap' : 'Full Name'}
          value={name}
          onChange={onNameChange}
          required
          disabled={loading}
        />
      </div>
      
      <div className="input-group">
        <FaEnvelope className="icon-left" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
          required
          disabled={loading}
        />
      </div>
      
      <div className="pw-row">
        <div className="input-group">
          <FaLock className="icon-left" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={locale === 'id' ? 'Kata Sandi (min. 6)' : 'Password (min. 6)'}
            value={password}
            onChange={onPasswordChange}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-pw"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="pw-strength-area" aria-hidden>
          <div className="pw-strength-bar">
            <div
              className="pw-strength-fill"
              style={{ width: `${pwStrength}%`, background: pwStrength < 40 ? 'var(--danger)' : pwStrength < 80 ? 'var(--warning)' : 'var(--accent)'}}
            />
          </div>
          <div className="pw-criteria">
            <span className={`pw-tag ${password.length >= 6 ? 'ok' : ''}`}>{locale === 'id' ? 'Min. 6 karakter' : 'Min. 6 chars'}</span>
            <span className={`pw-tag ${hasUpper ? 'ok' : ''}`}>{locale === 'id' ? 'Huruf besar' : 'Uppercase'}</span>
            <span className={`pw-tag ${hasLower ? 'ok' : ''}`}>{locale === 'id' ? 'Huruf kecil' : 'Lowercase'}</span>
            <span className={`pw-tag ${hasNumber ? 'ok' : ''}`}>{locale === 'id' ? 'Angka' : 'Number'}</span>
            <span className={`pw-tag ${hasSymbol ? 'ok' : ''}`}>{locale === 'id' ? 'Simbol' : 'Symbol'}</span>
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <FaShieldAlt className="icon-left" />
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={locale === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          required
          disabled={loading}
        />
        <button
          type="button"
          className="toggle-pw"
          onClick={() => setShowConfirmPassword((value) => !value)}
          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          disabled={loading}
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <label className="auth-terms">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={loading}
        />
        <span>
          {locale === 'id'
            ? 'Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi'
            : 'I agree to the Terms & Conditions and Privacy Policy'}
        </span>
      </label>
      
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (locale === 'id' ? 'Memproses...' : 'Processing...') : (locale === 'id' ? 'Daftar' : 'Register')}
      </button>
    </form>
  );
}

export default RegisterInput;