const DATA_STORAGE_KEY = 'finnice_data';
const USER_STORAGE_KEY = 'finnice_user';
const LEGACY_EMAIL = 'finnice@gmail.com';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
export const DEMO_EMAIL = 'timfinnice@gmail.com';
export const DEMO_PASSWORD = 'timfinnice123';

const demoTransactions = [
  { id: 101, type: 'income', category: 'Gaji', description: 'Gaji bulanan', amount: 12000000, date: '2026-05-01', icon: 'fa-briefcase', color: '#00e6b8' },
  { id: 102, type: 'income', category: 'Freelance', description: 'Desain UI landing page', amount: 2500000, date: '2026-05-08', icon: 'fa-laptop-code', color: '#60a5fa' },
  { id: 103, type: 'expense', category: 'Makanan', description: 'Belanja mingguan', amount: 850000, date: '2026-05-03', icon: 'fa-utensils', color: '#ff7b8a' },
  { id: 104, type: 'expense', category: 'Transportasi', description: 'Bensin dan parkir', amount: 350000, date: '2026-05-05', icon: 'fa-car', color: '#ffb347' },
  { id: 105, type: 'expense', category: 'Tagihan', description: 'Listrik dan internet', amount: 900000, date: '2026-05-10', icon: 'fa-file-invoice', color: '#a78bfa' },
  { id: 106, type: 'expense', category: 'Hiburan', description: 'Nonton film', amount: 180000, date: '2026-05-12', icon: 'fa-film', color: '#fb923c' },
];

const demoBudgets = [
  { id: 201, category: 'Makanan', limit: 1500000, spent: 850000, icon: 'fa-utensils', color: '#ff7b8a' },
  { id: 202, category: 'Transportasi', limit: 700000, spent: 350000, icon: 'fa-car', color: '#ffb347' },
  { id: 203, category: 'Tagihan', limit: 1200000, spent: 900000, icon: 'fa-file-invoice', color: '#a78bfa' },
  { id: 204, category: 'Hiburan', limit: 500000, spent: 180000, icon: 'fa-film', color: '#fb923c' },
];

const demoAccounts = [
  { id: 301, name: 'BCA Tabungan', type: 'Bank', provider: 'BCA', accountNumber: '1234567890', balance: 12500000, icon: 'fa-building-columns', color: '#00e6b8', image: '/img/Bank/BCA.jpg' },
  { id: 302, name: 'GoPay', type: 'E-Wallet', provider: 'GoPay', accountNumber: '081234567890', balance: 500000, icon: 'fa-wallet', color: '#60a5fa', image: '/img/E-Wallet/GOPAY.png' },
];

const createEmptyData = (user = {}) => ({
  transactions: [],
  budgets: [],
  accounts: [],
  user: {
    name: user.name || '',
    email: user.email || '',
  },
});

const createDemoData = (user = {}) => ({
  transactions: demoTransactions,
  budgets: demoBudgets,
  accounts: demoAccounts,
  user: {
    name: user.name || 'Demo User',
    email: user.email || DEMO_EMAIL,
  },
});

export const getDataStorageKey = (email) => {
  if (!email) return DATA_STORAGE_KEY;
  if (String(email).trim().toLowerCase() === LEGACY_EMAIL) return DATA_STORAGE_KEY;
  return `${DATA_STORAGE_KEY}_${encodeURIComponent(String(email).trim().toLowerCase())}`;
};

const isEmptyFinanceData = (value) => {
  if (!value) return true;
  return (
    Array.isArray(value.transactions) && value.transactions.length === 0 &&
    Array.isArray(value.budgets) && value.budgets.length === 0 &&
    Array.isArray(value.accounts) && value.accounts.length === 0
  );
};

export const setActiveUserData = (user) => {
  const email = user?.email || '';
  const key = getDataStorageKey(email);
  localStorage.setItem(DATA_STORAGE_KEY, key);
  if (!localStorage.getItem(key)) {
    const initialData = DEMO_MODE ? createDemoData(user) : createEmptyData(user);
    localStorage.setItem(key, JSON.stringify(initialData));
  }
  return key;
};

const getActiveDataKey = () => {
  const storedKey = localStorage.getItem(DATA_STORAGE_KEY);
  if (storedKey) return storedKey;

  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      const primaryKey = getDataStorageKey(parsedUser.email);
      const altKey = `${DATA_STORAGE_KEY}_${encodeURIComponent(String(parsedUser.email || '').trim().toLowerCase())}`;

      const primaryData = localStorage.getItem(primaryKey);
      const altData = altKey !== primaryKey ? localStorage.getItem(altKey) : null;

      if (isEmptyFinanceData(primaryData ? JSON.parse(primaryData) : null) && altData) {
        const parsedAlt = JSON.parse(altData);
        if (!isEmptyFinanceData(parsedAlt)) {
          localStorage.setItem(primaryKey, JSON.stringify(parsedAlt));
          if (primaryKey !== altKey) {
            localStorage.setItem(altKey, JSON.stringify(parsedAlt));
          }
        }
      }

      return primaryKey;
    } catch {
      return DATA_STORAGE_KEY;
    }
  }

  return DATA_STORAGE_KEY;
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Inisialisasi data di localStorage
const initData = () => {
  const dataKey = getActiveDataKey();
  const saved = localStorage.getItem(dataKey);
  if (!saved) {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    let currentUser = {};

    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser) || {};
      } catch {
        currentUser = {};
      }
    }

    localStorage.setItem(dataKey, JSON.stringify(DEMO_MODE ? createDemoData(currentUser) : createEmptyData(currentUser)));
  }
};

// Ambil semua data
const getData = () => {
  initData();
  return JSON.parse(localStorage.getItem(getActiveDataKey()));
};

// Simpan data
const saveData = (data) => {
  localStorage.setItem(getActiveDataKey(), JSON.stringify(data));
};

export { createEmptyData, saveData };

// Update saldo akun berdasarkan transaksi
export const updateAccountBalances = async () => {
  const data = getData();
  const transactions = data.transactions;
  
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  if (data.accounts.length > 0) {
    const balance = totalIncome - totalExpense;
    data.accounts[0].balance = balance;
    saveData(data);
  }
  
  return { error: false };
};

// Update spent budget ketika transaksi ditambah
export const updateBudgetSpent = async () => {
  const data = getData();
  const transactions = data.transactions;
  
  // Reset spent semua budget ke 0
  data.budgets.forEach(budget => {
    budget.spent = 0;
  });
  
  // Hitung ulang spent dari transaksi expense
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      const budget = data.budgets.find(b => b.category === tx.category);
      if (budget) {
        budget.spent += tx.amount;
      }
    }
  });
  
  saveData(data);
  return { error: false };
};

// ============ API Methods ============

// Transactions
export const getTransactions = async () => {
  const data = getData();
  return { error: false, data: data.transactions };
};

export const addTransaction = async (transaction) => {
  const data = getData();
  const baseTx = { id: Date.now(), ...transaction };
  const predictedTx = await enrichTransactionWithAIPrediction(baseTx);
  const newTx = predictedTx;
  data.transactions = [newTx, ...data.transactions];
  saveData(data);
  
  await updateBudgetSpent();
  await updateAccountBalances();
  
  return { error: false, data: newTx };
};

const enrichTransactionWithAIPrediction = async (transaction) => {
  try {
    const prediction = await postJson('/finance/ai/predict', { transaction });
    if (prediction.error) return transaction;

    return {
      ...transaction,
      aiPrediction: prediction.data,
      aiPredictedAt: new Date().toISOString(),
    };
  } catch {
    return transaction;
  }
};

export const deleteTransaction = async (id) => {
  const data = getData();
  data.transactions = data.transactions.filter(tx => tx.id !== id);
  saveData(data);
  
  await updateBudgetSpent();
  await updateAccountBalances();
  
  return { error: false };
};

export const updateTransaction = async (id, transaction) => {
  const data = getData();
  const index = data.transactions.findIndex(tx => tx.id === id);
  
  if (index !== -1) {
    data.transactions[index] = { ...transaction, id };
    saveData(data);
    await updateBudgetSpent();
    await updateAccountBalances();
    return { error: false, data: data.transactions[index] };
  }
  
  return { error: true, message: 'Transaction not found' };
};

// Budgets
export const getBudgets = async () => {
  const data = getData();
  return { error: false, data: data.budgets };
};

export const addBudget = async (budget) => {
  const data = getData();
  const newBudget = { id: Date.now(), spent: 0, ...budget };
  data.budgets.push(newBudget);
  saveData(data);
  return { error: false, data: newBudget };
};

// Accounts
export const getAccounts = async () => {
  const data = getData();
  return { error: false, data: data.accounts };
};

export const addAccount = async (account) => {
  const data = getData();
  const newAccount = { id: Date.now(), ...account };
  data.accounts.push(newAccount);
  saveData(data);
  return { error: false, data: newAccount };
};

export const deleteAccount = async (id) => {
  const data = getData();
  data.accounts = data.accounts.filter(acc => acc.id !== id);
  saveData(data);
  return { error: false };
};

// User
export const getUser = async () => {
  const data = getData();
  return { error: false, data: data.user };
};

export const updateUser = async (userData) => {
  const data = getData();
  data.user = { ...data.user, ...userData };
  saveData(data);
  return { error: false, data: data.user };
};

const postJson = async (path, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      return { error: true, message: 'Invalid JSON response from server' };
    }

    if (!response.ok || !result.success) {
      return { error: true, message: result.message || 'Request failed' };
    }

    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message || 'Network error' };
  }
};

export const getAIAdvice = async ({ budgets = [], transactions = [], locale = 'id' } = {}) => {
  try {
    return await postJson('/finance/advice', { budgets, transactions, locale });
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getAIModelStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/ai/status`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { error: true, message: result.message || 'AI model status check failed' };
    }
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message || 'Network error' };
  }
};

export const predictTransactionAI = async (transactionPayload = {}) => {
  try {
    return await postJson('/finance/ai/predict', transactionPayload);
  } catch (error) {
    return { error: true, message: error.message || 'Failed to predict transaction' };
  }
};

export const getAIRecommendation = async (recommendationPayload = {}) => {
  try {
    return await postJson('/finance/ai/recommend', recommendationPayload);
  } catch (error) {
    return { error: true, message: error.message || 'Failed to get AI recommendation' };
  }
};