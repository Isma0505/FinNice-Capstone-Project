// src/controllers/financeController.js

const db = require('../config/database');

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

// ============ AI ADVICE (sementara pake logika sederhana) ============
const getAiAdvice = async (req, res) => {
  try {
    const { budgets = [], transactions = [], locale = 'id' } = req.body || {};
    
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const savings = totalIncome - totalExpense;
    const savingsPercent = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
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
  } catch (error) {
    console.error('Error getAiAdvice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAiModelStatus = async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'available',
      message: 'AI service is ready'
    }
  });
};

const getAiModelPrediction = async (req, res) => {
  res.json({
    success: true,
    data: {
      prediction: 'normal',
      probabilities: [0.8, 0.2]
    }
  });
};

const getAiModelRecommendation = async (req, res) => {
  res.json({
    success: true,
    data: {
      recommendations: ['Buat budget bulanan', 'Catat semua pengeluaran kecil']
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
  deleteAccount,
  getAiAdvice,
  getAiModelStatus,
  getAiModelPrediction,
  getAiModelRecommendation
};