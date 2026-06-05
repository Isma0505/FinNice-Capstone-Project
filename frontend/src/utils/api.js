// src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ============ HELPER FUNCTIONS ============

// Helper untuk mengambil token dari localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('finnice_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper untuk request dengan auth header
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// ============ AUTH ENDPOINTS ============

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { error: !data.success, ...data };
  } catch (error) {
    return { error: true, success: false, message: error.message };
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    
    if (data.success && data.token) {
      const user = data.user;
      user.token = data.token;
      localStorage.setItem('finnice_user', JSON.stringify(user));
    }
    
    return { error: !data.success, ...data };
  } catch (error) {
    return { error: true, success: false, message: error.message };
  }
};

export const verifyEmail = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    return { error: !data.success, ...data };
  } catch (error) {
    return { error: true, success: false, message: error.message };
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { error: !data.success, ...data };
  } catch (error) {
    return { error: true, success: false, message: error.message };
  }
};

export const getProfile = async () => {
  try {
    const result = await authFetch('/auth/profile');
    return { error: false, user: result.user };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const logout = async () => {
  localStorage.removeItem('finnice_user');
  localStorage.removeItem('finnice_avatar');
  localStorage.removeItem('finnice_custom_avatar');
  localStorage.removeItem('finnice_data');
  localStorage.removeItem('finnice_data_key');
  return { error: false, success: true };
};

// ============ TRANSACTIONS ENDPOINTS ============

export const getTransactions = async () => {
  try {
    const result = await authFetch('/finance/transactions');
    return { error: false, data: result.transactions || [] };
  } catch (error) {
    return { error: true, message: error.message, data: [] };
  }
};

export const addTransaction = async (transaction) => {
  try {
    const result = await authFetch('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const updateTransaction = async (id, transaction) => {
  try {
    const result = await authFetch(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const deleteTransaction = async (id) => {
  try {
    await authFetch(`/finance/transactions/${id}`, {
      method: 'DELETE',
    });
    return { error: false };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============ BUDGETS ENDPOINTS ============

export const getBudgets = async () => {
  try {
    const result = await authFetch('/finance/budgets');
    return { error: false, data: result.budgets || [] };
  } catch (error) {
    return { error: true, message: error.message, data: [] };
  }
};

export const addBudget = async (budget) => {
  try {
    const result = await authFetch('/finance/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const updateBudget = async (id, budget) => {
  try {
    const result = await authFetch(`/finance/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const deleteBudget = async (id) => {
  try {
    await authFetch(`/finance/budgets/${id}`, {
      method: 'DELETE',
    });
    return { error: false };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============ ACCOUNTS ENDPOINTS ============

export const getAccounts = async () => {
  try {
    const result = await authFetch('/finance/accounts');
    return { error: false, data: result.accounts || [] };
  } catch (error) {
    return { error: true, message: error.message, data: [] };
  }
};

export const addAccount = async (account) => {
  try {
    const result = await authFetch('/finance/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const deleteAccount = async (id) => {
  try {
    await authFetch(`/finance/accounts/${id}`, {
      method: 'DELETE',
    });
    return { error: false };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============ SUMMARY ENDPOINTS ============

export const getSummary = async () => {
  try {
    const result = await authFetch('/finance/summary');
    return { error: false, data: result.summary };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============ AI ENDPOINTS ============

export const getAIAdvice = async ({ budgets, transactions, locale = 'id' }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgets, transactions, locale }),
    });
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { error: true, message: data.message || 'AI advice failed' };
    }
    
    return { error: false, data: data.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getAIModelStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/ai/status`);
    const data = await response.json();
    return { error: false, data: data.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const predictTransaction = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/ai/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    const data = await response.json();
    return { error: false, data: data.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getAIRecommendation = async (payload = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { error: false, data: data.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============ DEMO / LEGACY ============

export const DEMO_EMAIL = 'timfinnice@gmail.com';
export const DEMO_PASSWORD = 'timfinnice123';

export const setActiveUserData = (user) => {
  if (user && user.token) {
    const userWithToken = { ...user };
    localStorage.setItem('finnice_user', JSON.stringify(userWithToken));
  } else if (user && !user.token) {
    localStorage.setItem('finnice_user', JSON.stringify(user));
  }
};

export const saveData = (data) => {
  const dataKey = localStorage.getItem('finnice_data');
  if (dataKey) {
    localStorage.setItem(dataKey, JSON.stringify(data));
  }
};

// Untuk backward compatibility dengan komponen yang masih paya ini
export const getDataStorageKey = (email) => {
  return `finnice_data_${email}`;
};

export const updateAccount = async (id, account) => {
  try {
    const result = await authFetch(`/finance/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
    return { error: false, data: result.data };
  } catch (error) {
    return { error: true, message: error.message };
  }
};