const transactions = [
  { id: 1, type: 'income', category: 'Gaji', desc: 'Gaji bulan Juni', amount: 15000000, date: '2024-06-01', icon: 'fa-briefcase', color: '#00e6b8' },
  { id: 2, type: 'income', category: 'Freelance', desc: 'Proyek desain UI', amount: 3500000, date: '2024-06-05', icon: 'fa-laptop-code', color: '#60a5fa' },
  { id: 3, type: 'expense', category: 'Makanan', desc: 'Makan siang kantor', amount: 75000, date: '2024-06-15', icon: 'fa-utensils', color: '#ff7b8a' },
  { id: 4, type: 'expense', category: 'Transportasi', desc: 'Bensin motor', amount: 150000, date: '2024-06-14', icon: 'fa-car', color: '#ffb347' },
  { id: 5, type: 'expense', category: 'Belanja', desc: 'Beli baju baru', amount: 450000, date: '2024-06-12', icon: 'fa-bag-shopping', color: '#e056a0' },
  { id: 6, type: 'expense', category: 'Tagihan', desc: 'Listrik & Internet', amount: 850000, date: '2024-06-10', icon: 'fa-file-invoice', color: '#a78bfa' },
  { id: 7, type: 'income', category: 'Investasi', desc: 'Dividen saham', amount: 500000, date: '2024-06-08', icon: 'fa-chart-line', color: '#34d399' },
  { id: 8, type: 'expense', category: 'Hiburan', desc: 'Nonton bioskop', amount: 120000, date: '2024-06-07', icon: 'fa-film', color: '#fb923c' },
  { id: 9, type: 'expense', category: 'Kesehatan', desc: 'Obat & vitamin', amount: 200000, date: '2024-06-06', icon: 'fa-heart-pulse', color: '#f87171' },
  { id: 10, type: 'expense', category: 'Makanan', desc: 'Grocery mingguan', amount: 650000, date: '2024-06-04', icon: 'fa-cart-shopping', color: '#ff7b8a' },
  { id: 11, type: 'expense', category: 'Pendidikan', desc: 'Kursus online', amount: 350000, date: '2024-06-03', icon: 'fa-graduation-cap', color: '#818cf8' },
  { id: 12, type: 'income', category: 'Gaji', desc: 'Bonus proyek', amount: 2000000, date: '2024-06-02', icon: 'fa-briefcase', color: '#00e6b8' },
]

const budgets = [
  { id: 1, category: 'Makanan', limit: 3000000, spent: 1850000, icon: 'fa-utensils', color: '#ff7b8a' },
  { id: 2, category: 'Transportasi', limit: 1500000, spent: 1200000, icon: 'fa-car', color: '#ffb347' },
  { id: 3, category: 'Belanja', limit: 2000000, spent: 450000, icon: 'fa-bag-shopping', color: '#e056a0' },
  { id: 4, category: 'Tagihan', limit: 2000000, spent: 850000, icon: 'fa-file-invoice', color: '#a78bfa' },
  { id: 5, category: 'Hiburan', limit: 1000000, spent: 520000, icon: 'fa-film', color: '#fb923c' },
  { id: 6, category: 'Kesehatan', limit: 800000, spent: 200000, icon: 'fa-heart-pulse', color: '#f87171' },
  { id: 7, category: 'Pendidikan', limit: 1500000, spent: 350000, icon: 'fa-graduation-cap', color: '#818cf8' },
]

const accounts = [
  { id: 1, name: 'BCA Tabungan', type: 'Bank', balance: 8500000, icon: 'fa-building-columns', color: '#00e6b8' },
  { id: 2, name: 'Mandiri Giro', type: 'Bank', balance: 3200000, icon: 'fa-building-columns', color: '#60a5fa' },
  { id: 3, name: 'GoPay', type: 'E-Wallet', balance: 1500000, icon: 'fa-wallet', color: '#00aed6' },
  { id: 4, name: 'OVO', type: 'E-Wallet', balance: 800000, icon: 'fa-wallet', color: '#4c33cc' },
  { id: 5, name: 'Dompet Kas', type: 'Tunai', balance: 500000, icon: 'fa-money-bill-wave', color: '#ffb347' },
]

const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_MODEL_SERVICE_URL = process.env.AI_MODEL_SERVICE_URL || 'http://localhost:8001';

const toLowerText = (value) => String(value || '').trim().toLowerCase()

const normalizePredictPayload = (payload = {}) => {
  if (payload.amount && payload.year && payload.month && payload.day) {
    return payload
  }

  const tx = payload.transaction || payload
  const amount = Number(tx.amount || 0)
  const txDate = tx.date ? new Date(tx.date) : new Date()
  const category = toLowerText(tx.category)
  const accountText = toLowerText(tx.account || tx.accountType || tx.provider || tx.source)
  const txType = toLowerText(tx.type)

  return {
    amount,
    year: txDate.getFullYear(),
    month: txDate.getMonth() + 1,
    day: txDate.getDate(),
    'category_Bills & Fees': category === 'tagihan' || category === 'bills & fees' || category === 'bills',
    'category_Food & Drinks': category === 'makanan' || category === 'food' || category === 'food & drinks',
    category_Transport: category === 'transportasi' || category === 'transport',
    account_Cash: accountText.includes('cash') || accountText.includes('tunai') || accountText.includes('dompet') || accountText === '',
    'account_Metro Card': accountText.includes('metro'),
    'account_Salary Bank': accountText.includes('salary'),
    'account_Savings Bank': accountText.includes('saving') || accountText.includes('tabungan'),
    type_EXPENSE: txType === 'expense',
    type_INCOME: txType === 'income',
    type_TRANSFER: txType === 'transfer',
  }
}

const buildAdviceText = ({ locale, overBudgetItems, nearLimitItems, savings, savingsPercent }) => {
  if (overBudgetItems.length > 0) {
    const categories = overBudgetItems.map((budget) => budget.category).join(', ')
    return {
      type: 'danger',
      text: locale === 'id'
        ? `⚠️ Perhatian! Budget ${categories} sudah melebihi batas.`
        : `⚠️ Warning! Budget for ${categories} is already over the limit.`,
      suggestion: locale === 'id'
        ? 'Coba kurangi pengeluaran di kategori ini atau sesuaikan budget.'
        : 'Try reducing spending in these categories or adjust the budget.',
    }
  }

  if (nearLimitItems.length > 0) {
    const categories = nearLimitItems.map((budget) => budget.category).join(', ')
    return {
      type: 'warning',
      text: locale === 'id'
        ? `📊 Pengeluaran ${categories} sudah mendekati batas.`
        : `📊 Spending for ${categories} is approaching the limit.`,
      suggestion: locale === 'id'
        ? 'Pantau pengeluaran di kategori ini agar tidak over budget.'
        : 'Keep an eye on these categories so they do not go over budget.',
    }
  }

  if (savings < 0) {
    return {
      type: 'danger',
      text: locale === 'id'
        ? `⚠️ Pengeluaran melebihi pemasukan sebesar Rp ${Math.abs(savings).toLocaleString('id-ID')}.`
        : `⚠️ Spending is above income by Rp ${Math.abs(savings).toLocaleString('id-ID')}.`,
      suggestion: locale === 'id'
        ? 'Segera evaluasi pengeluaranmu.'
        : 'Review your expenses as soon as possible.',
    }
  }

  if (savingsPercent < 20 && savingsPercent > 0) {
    return {
      type: 'warning',
      text: locale === 'id'
        ? `💡 Tabungan hanya ${Math.round(savingsPercent)}% dari pemasukan.`
        : `💡 Savings are only ${Math.round(savingsPercent)}% of income.`,
      suggestion: locale === 'id'
        ? 'Targetkan minimal 20% untuk tabungan.'
        : 'Target at least 20% of your income for savings.',
    }
  }

  if (savings > 0) {
    return {
      type: 'success',
      text: locale === 'id'
        ? `🎉 Bagus! Kamu menabung Rp ${savings.toLocaleString('id-ID')} bulan ini.`
        : `🎉 Nice! You saved Rp ${savings.toLocaleString('id-ID')} this month.`,
      suggestion: locale === 'id'
        ? 'Pertahankan kebiasaan baik ini.'
        : 'Keep up the good habit.',
    }
  }

  return {
    type: 'info',
    text: locale === 'id'
      ? '🤖 Saya siap membantu menganalisis keuanganmu.'
      : '🤖 I am ready to help analyze your finances.',
    suggestion: locale === 'id'
      ? 'Tambah transaksi dan budget untuk saran yang lebih akurat.'
      : 'Add more transactions and budgets for more accurate advice.',
  }
}

const getTotalIncome = () => transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0)

const getTotalExpense = () => transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0)

// Enhanced fallback advice computation.
// This async version will try to annotate incoming transactions with AI model
// predictions (if AI model service is reachable). If predictions are available
// we include anomaly information in the advice/suggestion text.
const computeLocalAdvice = async (incomingBudgets, incomingTransactions, locale = 'id') => {
  const budgetSource = Array.isArray(incomingBudgets) && incomingBudgets.length > 0 ? incomingBudgets : budgets
  const transactionSource = Array.isArray(incomingTransactions) && incomingTransactions.length > 0 ? incomingTransactions : transactions

  // Try to call AI model service to get predictions for each transaction.
  let annotatedTransactions = transactionSource
  try {
    // Call prediction endpoint in parallel for each transaction (best-effort).
    const predPromises = transactionSource.map(async (tx) => {
      try {
        const modelPayload = normalizePredictPayload({ transaction: tx })
        const resp = await axios.post(`${AI_MODEL_SERVICE_URL}/predict`, { named_features: modelPayload }, { timeout: 3000 })
        // Resp should follow the AI model response shape: { success: true, data: { prediction: [...], probabilities: [...] } }
        const pred = resp?.data?.data?.prediction ? resp.data.data.prediction[0] : null
        const proba = resp?.data?.data?.probabilities ? resp.data.data.probabilities[0] : null
        return { ...tx, aiPrediction: pred, aiProbabilities: proba }
      } catch (err) {
        return { ...tx }
      }
    })

    const results = await Promise.all(predPromises)
    annotatedTransactions = results
  } catch (err) {
    // If any unexpected error occurs, fall back to original transactions
    annotatedTransactions = transactionSource
  }

  const overBudgetItems = []
  const nearLimitItems = []

  budgetSource.forEach((budget) => {
    const spent = annotatedTransactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0

    if (spent > budget.limit) {
      overBudgetItems.push({ ...budget, spent, percent })
    } else if (percent >= 80) {
      nearLimitItems.push({ ...budget, spent, percent })
    }
  })

  const totalIncome = annotatedTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpense = annotatedTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const savings = totalIncome - totalExpense
  const savingsPercent = totalIncome > 0 ? (savings / totalIncome) * 100 : 0
  const advice = buildAdviceText({ locale, overBudgetItems, nearLimitItems, savings, savingsPercent })

  // Check for model-detected anomalies and append a hint to suggestion if any
  const anomalyCount = annotatedTransactions.filter((t) => t.aiPrediction !== null && (t.aiPrediction === 1 || (Array.isArray(t.aiPrediction) && t.aiPrediction[0] === 1))).length
  let finalSuggestion = advice.suggestion || ''
  if (anomalyCount > 0) {
    finalSuggestion = `${finalSuggestion} ${locale === 'id' ? `Terdeteksi ${anomalyCount} transaksi mencurigakan — cek kembali.` : `Detected ${anomalyCount} suspicious transactions — please review.`}`.trim()
  }

  return {
    success: true,
    data: {
      advice: { ...advice, suggestion: finalSuggestion },
      summary: {
        totalIncome,
        totalExpense,
        savings,
        savingsPercent,
        overBudgetItems,
        nearLimitItems,
      },
    },
  }
}

const getAiAdvice = async (req, res) => {
  const { budgets: incomingBudgets, transactions: incomingTransactions, locale = 'id' } = req.body || {}

  // Try proxying to external AI service first
  try {
    const resp = await axios.post(`${AI_SERVICE_URL}/advice`, { budgets: incomingBudgets, transactions: incomingTransactions, locale }, { timeout: 3000 })
    if (resp && resp.data) {
      return res.json(resp.data)
    }
  } catch (err) {
    console.warn('AI service proxy failed, falling back to local logic:', err.message || err)
  }

  // Fallback to local computation (now async and may include model predictions)
  try {
    const local = await computeLocalAdvice(incomingBudgets, incomingTransactions, locale)
    return res.json(local)
  } catch (err) {
    // If something unexpected happens, return a safe error response
    console.warn('computeLocalAdvice failed:', err && err.message ? err.message : err)
    return res.status(500).json({ success: false, message: 'Failed to compute advice' })
  }
}

const getAiModelStatus = async (req, res) => {
  try {
    const [healthResponse, metadataResponse] = await Promise.all([
      axios.get(`${AI_MODEL_SERVICE_URL}/health`, { timeout: 3000 }),
      axios.get(`${AI_MODEL_SERVICE_URL}/metadata`, { timeout: 3000 }),
    ])

    return res.json({
      success: true,
      data: {
        health: healthResponse.data,
        metadata: metadataResponse.data,
      },
      serviceUrl: AI_MODEL_SERVICE_URL,
    })
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'AI Model service is unavailable',
      serviceUrl: AI_MODEL_SERVICE_URL,
      detail: err.message || 'Failed to connect to AI Model service',
    })
  }
}

const getAiModelPrediction = async (req, res) => {
  try {
    const modelPayload = normalizePredictPayload(req.body || {})
    const response = await axios.post(
      `${AI_MODEL_SERVICE_URL}/predict`,
      { named_features: modelPayload },
      { timeout: 5000 }
    )
    return res.json(response.data)
  } catch (err) {
    const status = err?.response?.status || 502
    const message = err?.response?.data?.detail || err?.message || 'Failed to get prediction from AI Model service'
    return res.status(status).json({
      success: false,
      message,
      serviceUrl: AI_MODEL_SERVICE_URL,
    })
  }
}

const getAiModelRecommendation = async (req, res) => {
  try {
    const response = await axios.post(`${AI_MODEL_SERVICE_URL}/advice`, req.body || {}, { timeout: 7000 })
    return res.json(response.data)
  } catch (err) {
    const status = err?.response?.status || 502
    const message = err?.response?.data?.detail || err?.message || 'Failed to get recommendation from AI Model service'
    return res.status(status).json({
      success: false,
      message,
      serviceUrl: AI_MODEL_SERVICE_URL,
    })
  }
}

const getSummary = (req, res) => {
  const income = getTotalIncome()
  const expense = getTotalExpense()
  const balance = income - expense
  const savings = balance * 0.2

  res.json({
    success: true,
    summary: {
      totalBalance: balance,
      totalIncome: income,
      totalExpense: expense,
      savings,
    },
  })
}

const getTransactions = (req, res) => {
  res.json({
    success: true,
    transactions,
  })
}

const getBudgets = (req, res) => {
  res.json({
    success: true,
    budgets,
  })
}

const getAccounts = (req, res) => {
  res.json({
    success: true,
    accounts,
  })
}

module.exports = {
  getSummary,
  getTransactions,
  getBudgets,
  getAccounts,
  getAiAdvice,
  getAiModelStatus,
  getAiModelPrediction,
  getAiModelRecommendation,
}