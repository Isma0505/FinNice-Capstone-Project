const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/database');
const authSettings = require('./config/auth');
const emailService = require('./services/emailService');

const createVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const getVerificationMessage = (reason) => {
  if (reason === 'not_found') return 'Email tidak ditemukan';
  if (reason === 'invalid_code') return 'Kode verifikasi salah';
  if (reason === 'expired') return 'Kode verifikasi sudah habis';
  return 'Verifikasi gagal';
};

const buildUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name
});

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ success: false, message: 'Email, password, dan name harus diisi' });

    const userExists = await db.findUserByEmail(email);
    if (userExists) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, authSettings.SALT_ROUNDS);
    const newUser = await db.addUser({ email, password: hashedPassword, name });

    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    try { await db.setVerificationCode(newUser.id, code, expiresAt); } catch (e) { console.warn('save code failed', e.message||e); }
    try { await emailService.sendVerificationEmail(newUser.email, code); } catch (e) { console.warn('send mail failed', e.message||e); }

    return res.status(201).json({ success: true, message: 'Registrasi berhasil. Kode verifikasi dikirim.', user: buildUserResponse(newUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });

    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = jwt.sign({ userId: user.id, email: user.email }, authSettings.JWT_SECRET, { expiresIn: authSettings.TOKEN_EXPIRY });

    return res.status(200).json({ success: true, message: 'Login berhasil', token, user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email dan kode diperlukan' });
    const verification = await db.verifyAndActivateByEmail(email, code);
    if (!verification.ok) {
      return res.status(400).json({ success: false, message: getVerificationMessage(verification.reason) });
    }
    return res.status(200).json({ success: true, message: 'Email berhasil diverifikasi', user: verification.user });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email diperlukan' });
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });
    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.setVerificationCode(user.id, code, expiresAt);
    try { await emailService.sendVerificationEmail(user.email, code); } catch (e) { console.warn('resend failed', e.message||e); }
    return res.status(200).json({ success: true, message: 'Kode verifikasi telah dikirim ulang' });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const user = await db.findUserById(currentUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at } });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const logout = (req, res) => {
  return res.status(200).json({ success: true, message: 'Logout berhasil, token dihapus dari client' });
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Format token tidak valid' });
    try {
      const decoded = jwt.verify(token, authSettings.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token tidak valid atau expired' });
    }
  } catch (error) { return res.status(500).json({ success: false, message: 'Error verifikasi token', error: error.message }); }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  getProfile,
  logout,
  verifyToken
};
