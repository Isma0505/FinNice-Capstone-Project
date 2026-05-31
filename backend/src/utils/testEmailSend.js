const emailService = require('../services/emailService');

(async () => {
  try {
    const res = await emailService.sendVerificationEmail('test@example.local', '123456');
    console.log('Hasil kirim:', res);
    process.exit(0);
  } catch (err) {
    console.error('Gagal kirim email:', err.message || err);
    process.exit(1);
  }
})();
