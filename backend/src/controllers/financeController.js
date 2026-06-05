// src/controllers/financeController.js
const db = require('../config/database');
const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// ============ SUMMARY ============
const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await db.getSummaryByUser(userId);
    
    res.json({
      success: true,
      summary: {
        totalBalance: summary.balance,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.balance > 0 ? summary.balance * 0.2 : 0
      }
    });
  } catch (error) {
    console.error('Error getSummary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ TRANSACTIONS ============
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 100;
    const transactions = await db.getTransactionsByUser(userId, limit);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getTransactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactionData = req.body;
    
    // Bersihkan amount
    transactionData.amount = Math.round(Number(transactionData.amount));
    
    const newTransaction = await db.addTransaction(userId, transactionData);
    
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Transaksi berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error addTransaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactionId = req.params.id;
    const transactionData = req.body;
    
    const updated = await db.updateTransaction(transactionId, userId, transactionData);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Transaksi berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updateTransaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactionId = req.params.id;
    
    const deleted = await db.deleteTransaction(transactionId, userId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleteTransaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ BUDGETS ============
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgets = await db.getBudgetsByUser(userId);
    
    res.json({
      success: true,
      budgets
    });
  } catch (error) {
    console.error('Error getBudgets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetData = req.body;
    
    const newBudget = await db.addBudget(userId, budgetData);
    
    res.status(201).json({
      success: true,
      data: newBudget,
      message: 'Budget berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error addBudget:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;
    const budgetData = req.body;
    
    const updated = await db.updateBudget(budgetId, userId, budgetData);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Budget tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Budget berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updateBudget:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;
    
    const deleted = await db.deleteBudget(budgetId, userId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Budget tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Budget berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleteBudget:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ACCOUNTS ============
const getAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accounts = await db.getAccountsByUser(userId);
    
    res.json({
      success: true,
      accounts
    });
  } catch (error) {
    console.error('Error getAccounts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accountData = req.body;
    
    const newAccount = await db.addAccount(userId, accountData);
    
    res.status(201).json({
      success: true,
      data: newAccount,
      message: 'Akun berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error addAccount:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accountId = req.params.id;
    const { name, balance } = req.body;
    
    const updated = await db.updateAccount(accountId, userId, { name, balance });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accountId = req.params.id;
    
    const deleted = await db.deleteAccount(accountId, userId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Akun berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleteAccount:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ AI ADVICE ============
const getAiAdvice = async (req, res) => {
  const { budgets = [], transactions = [], locale = 'id' } = req.body || {};
  
  // Hitung data ringkasan lokal sebagai bagian dari fallback dan verifikasi
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const savings = totalIncome - totalExpense;
  const savingsPercent = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  try {
    // Panggil API Python
    const response = await axios.post(`${AI_SERVICE_URL}/advice`, {
      budgets,
      transactions,
      locale
    }, { timeout: 4000 });
    if (response.data && response.data.success && response.data.data) {
      return res.json({
        success: true,
        data: response.data.data
      });
    }
  } catch (error) {
    console.warn(`Menggunakan fallback saran lokal karena AI Service offline/error:`, error.message);
  }
  
  // LOGIKA FALLBACK (jika Python API error/offline)
  let advice = {};
  
  if (savings < 0) {
    advice = {
      type: 'danger',
      text: locale === 'id' 
        ? `⚠️ Pengeluaran melebihi pemasukan Rp ${Math.abs(savings).toLocaleString('id-ID')}`
        : `⚠️ Spending exceeds income by Rp ${Math.abs(savings).toLocaleString()}`,
      suggestion: locale === 'id' ? 'Segera evaluasi pengeluaranmu!' : 'Review your expenses immediately!'
    };
  } else if (savingsPercent < 20 && savingsPercent > 0) {
    advice = {
      type: 'warning',
      text: locale === 'id'
        ? `💡 Tabungan hanya ${Math.round(savingsPercent)}% dari pemasukan`
        : `💡 Savings are only ${Math.round(savingsPercent)}% of income`,
      suggestion: locale === 'id' ? 'Targetkan minimal 20% untuk tabungan' : 'Target at least 20% for savings'
    };
  } else if (savings > 0) {
    advice = {
      type: 'success',
      text: locale === 'id'
        ? `🎉 Bagus! Kamu menabung Rp ${savings.toLocaleString('id-ID')}`
        : `🎉 Great! You saved Rp ${savings.toLocaleString()}`,
      suggestion: locale === 'id' ? 'Pertahankan kebiasaan baik ini!' : 'Keep up the good habit!'
    };
  } else {
    advice = {
      type: 'info',
      text: locale === 'id' ? '🤖 Siap membantu keuanganmu' : '🤖 Ready to help your finances',
      suggestion: locale === 'id' ? 'Tambah transaksi untuk saran lebih akurat' : 'Add more transactions for better advice'
    };
  }
  res.json({
    success: true,
    data: {
      advice,
      summary: { totalIncome, totalExpense, savings, savingsPercent }
    }
  });
};

const getAiModelStatus = async (req, res) => {
  try {
    // Panggil /health ke FastAPI
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    
    // Coba ambil metadata jika ada
    let metadata = null;
    try {
      const metaRes = await axios.get(`${AI_SERVICE_URL}/metadata`, { timeout: 2000 });
      if (metaRes.data && metaRes.data.success) {
        metadata = metaRes.data.metadata;
      } else if (metaRes.data && metaRes.data.metadata) {
        metadata = metaRes.data.metadata;
      }
    } catch (metaErr) {
      console.warn('Gagal memuat metadata AI, tetapi service tetap online:', metaErr.message);
    }
    res.json({
      success: true,
      data: {
        status: 'available',
        message: 'AI service is ready',
        metadata: metadata
      }
    });
  } catch (error) {
    console.warn(`AI Service offline (${AI_SERVICE_URL}):`, error.message);
    res.json({
      success: true,
      data: {
        status: 'unavailable',
        message: 'AI service is offline (fallback active)'
      }
    });
  }
};

const getAiModelPrediction = async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, req.body, { timeout: 4000 });
    if (response.data && response.data.success) {
      return res.json({
        success: true,
        data: response.data.data
      });
    }
    if (response.data && response.data.prediction) {
      return res.json({
        success: true,
        data: response.data
      });
    }
  } catch (error) {
    console.warn(`Menggunakan fallback prediksi karena AI Service offline/error:`, error.message);
  }
  // Fallback prediction
  res.json({
    success: true,
    data: {
      prediction: 'normal',
      probabilities: [0.8, 0.2],
      is_fallback: true
    }
  });
};

const getAiModelRecommendation = async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, req.body, { timeout: 4000 });
    if (response.data && response.data.success) {
      return res.json({
        success: true,
        data: response.data
      });
    }
    if (response.data && response.data.recommendation) {
      return res.json({
        success: true,
        data: {
          recommendations: [response.data.recommendation]
        }
      });
    }
  } catch (error) {
    console.warn(`Menggunakan fallback rekomendasi lokal karena AI Service offline/error atau endpoint /recommend tidak didukung:`, error.message);
  }
  // Fallback recommendations
  res.json({
    success: true,
    data: {
      recommendations: [
        'Buat budget bulanan untuk mengontrol pengeluaran',
        'Catat semua pengeluaran kecil agar tidak boncos',
        'Sisihkan minimal 10%-20% dari pendapatan untuk dana darurat'
      ],
      is_fallback: true
    }
  });
};

// ============ EXPORTS ============
module.exports = {
  getSummary,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getAiAdvice,
  getAiModelStatus,
  getAiModelPrediction,
  getAiModelRecommendation
};
