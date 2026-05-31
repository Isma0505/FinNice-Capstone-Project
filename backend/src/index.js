const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')({ origin: true }));

app.use('/auth', authRoutes);
app.use('/finance', financeRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'FinNice App Backend Server Berjalan',
    status: 'OK',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      getProfile: 'GET /auth/profile (perlu token)',
      logout: 'POST /auth/logout',
      summary: 'GET /finance/summary (perlu token)',
      transactions: 'GET /finance/transactions (perlu token)',
      budgets: 'GET /finance/budgets (perlu token)',
      accounts: 'GET /finance/accounts (perlu token)',
      aiAdvice: 'POST /finance/advice'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan',
    requestedPath: req.path
  });
});

// Global error handler to catch errors forwarded with next(err)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ success: false, message: err && err.message ? err.message : 'Internal server error' });
});

// Catch unhandled promise rejections and uncaught exceptions to avoid process crash
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
