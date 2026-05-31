const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) return null;

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: user && pass ? { user, pass } : undefined
  });

  return transporter;
};

const sendVerificationEmail = async (to, code) => {
  const tr = getTransporter();
  const from = process.env.EMAIL_FROM || `FinNice <no-reply@finnice.local>`;

  if (!tr) {
    console.warn('SMTP not configured: skipping actual email send');
    return {
      sent: false,
      preview: `DEV_ONLY: verification code for ${to} => ${code}`
    };
  }

  const mailOptions = {
    from,
    to,
    subject: 'Kode Verifikasi FinNice',
    text: `Kode verifikasi Anda: ${code}`,
    html: `<p>Halo,</p><p>Gunakan kode berikut untuk memverifikasi email Anda:</p><h2>${code}</h2><p>Kode ini berlaku untuk 10 menit.</p>`
  };

  const info = await tr.sendMail(mailOptions);
  return { sent: true, info };
};

module.exports = {
  sendVerificationEmail
};
