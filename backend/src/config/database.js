const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finnice_app'
});

// ============ AUTO MIGRASI ============
const ensureColumns = async () => {
  try {
    // Cek dan tambah kolom image di tabel accounts
    const checkImage = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts' AND column_name = 'image'
    `);
    
    if (checkImage.rows.length === 0) {
      console.log('🔧 Menambahkan kolom image ke tabel accounts...');
      await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS image TEXT`);
      console.log('✓ Kolom image berhasil ditambahkan');
    }
    
    // Cek dan tambah kolom updated_at di tabel accounts
    const checkUpdatedAt = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts' AND column_name = 'updated_at'
    `);
    
    if (checkUpdatedAt.rows.length === 0) {
      console.log('🔧 Menambahkan kolom updated_at ke tabel accounts...');
      await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('✓ Kolom updated_at berhasil ditambahkan');
    }
    
  } catch (error) {
    console.error('❌ Error saat migrasi:', error.message);
  }
};

pool.on('connect', async () => {
  console.log('✓ Terhubung ke PostgreSQL');
  await ensureColumns();
});

pool.on('error', (error) => {
  console.error('❌ Error connection pool:', error);
});

// ============ USERS ============

const addUser = async (userData) => {
  const query = `
    INSERT INTO users (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
  `;
  const result = await pool.query(query, [userData.email, userData.password, userData.name]);
  return result.rows[0];
};

const setVerificationCode = async (userId, code, expiresAt) => {
  const query = `
    UPDATE users
    SET verification_code = $1, verification_expires = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, email
  `;

  const result = await pool.query(query, [code, expiresAt, userId]);
  return result.rows[0] || null;
};

const verifyAndActivateByEmail = async (email, code) => {
  const selectQ = `
    SELECT id, verification_code, verification_expires
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const sel = await pool.query(selectQ, [email]);
  const row = sel.rows[0];
  if (!row) return { ok: false, reason: 'not_found' };

  if (!row.verification_code || row.verification_code !== code) return { ok: false, reason: 'invalid_code' };

  if (row.verification_expires && new Date(row.verification_expires) < new Date()) return { ok: false, reason: 'expired' };

  const updateQ = `
    UPDATE users
    SET email_verified = true, verification_code = NULL, verification_expires = NULL, updated_at = NOW()
    WHERE id = $1
    RETURNING id, email
  `;

  const res = await pool.query(updateQ, [row.id]);
  return { ok: true, user: res.rows[0] };
};

const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password, name, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

const findUserById = async (id) => {
  const query = `
    SELECT id, email, name, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

const getAllUsers = async () => {
  const query = `
    SELECT id, email, name, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updateUser = async (id, userData) => {
  const query = `
    UPDATE users
    SET name = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, name, created_at
  `;
  const result = await pool.query(query, [userData.name, id]);
  return result.rows[0] || null;
};

const deleteUser = async (id) => {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, email, name
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

// ============ TRANSACTIONS ============

const getTransactionsByUser = async (userId, limit = 100) => {
  const query = `
    SELECT id, type, category, description, amount, date, icon, color, created_at
    FROM transactions
    WHERE user_id = $1
    ORDER BY date DESC, id DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

const addTransaction = async (userId, transactionData) => {
  const { type, category, description, amount, date, icon, color } = transactionData;
  const query = `
    INSERT INTO transactions (user_id, type, category, description, amount, date, icon, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, type, category, description, amount, date, icon, color
  `;
  // Pastikan amount dibulatkan ke integer terdekat
  const cleanAmount = Math.round(Number(amount));
  const result = await pool.query(query, [userId, type, category, description, cleanAmount, date, icon, color]);
  return result.rows[0];
};

const updateTransaction = async (transactionId, userId, transactionData) => {
  const { type, category, description, amount, date, icon, color } = transactionData;
  const query = `
    UPDATE transactions
    SET type = $1, category = $2, description = $3, amount = $4, date = $5, icon = $6, color = $7
    WHERE id = $8 AND user_id = $9
    RETURNING id, type, category, description, amount, date, icon, color
  `;
  const result = await pool.query(query, [type, category, description, amount, date, icon, color, transactionId, userId]);
  return result.rows[0];
};

const deleteTransaction = async (transactionId, userId) => {
  const query = `
    DELETE FROM transactions
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [transactionId, userId]);
  return result.rows[0];
};

// ============ BUDGETS ============

const getBudgetsByUser = async (userId) => {
  const query = `
    SELECT id, category, limit_amount as limit, icon, color, created_at
    FROM budgets
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const addBudget = async (userId, budgetData) => {
  const { category, limit, icon, color } = budgetData;
  const query = `
    INSERT INTO budgets (user_id, category, limit_amount, icon, color)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, category, limit_amount as limit, icon, color
  `;
  const result = await pool.query(query, [userId, category, limit, icon, color]);
  return result.rows[0];
};

const updateBudget = async (budgetId, userId, budgetData) => {
  const { category, limit, icon, color } = budgetData;
  const query = `
    UPDATE budgets
    SET category = $1, limit_amount = $2, icon = $3, color = $4, updated_at = NOW()
    WHERE id = $5 AND user_id = $6
    RETURNING id, category, limit_amount as limit, icon, color
  `;
  const result = await pool.query(query, [category, limit, icon, color, budgetId, userId]);
  return result.rows[0];
};

const deleteBudget = async (budgetId, userId) => {
  const query = `
    DELETE FROM budgets
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [budgetId, userId]);
  return result.rows[0];
};

// ============ ACCOUNTS ============

const getAccountsByUser = async (userId) => {
  const query = `
    SELECT id, name, type, provider, account_number, balance, icon, color, image, created_at
    FROM accounts
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const addAccount = async (userId, accountData) => {
  const { name, type, provider, accountNumber, balance, icon, color, image } = accountData;
  const query = `
    INSERT INTO accounts (user_id, name, type, provider, account_number, balance, icon, color, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, type, provider, account_number, balance, icon, color, image
  `;
  const result = await pool.query(query, [userId, name, type, provider, accountNumber, balance || 0, icon, color, image]);
  return result.rows[0];
};

const updateAccount = async (accountId, userId, { name, balance }) => {
  const query = `
    UPDATE accounts
    SET name = $1, balance = $2, updated_at = NOW()
    WHERE id = $3 AND user_id = $4
    RETURNING id, name, type, provider, account_number, balance, icon, color, image
  `;
  const result = await pool.query(query, [name, balance, accountId, userId]);
  return result.rows[0];
};

const updateAccountBalance = async (accountId, newBalance) => {
  const query = `
    UPDATE accounts
    SET balance = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, balance
  `;
  const result = await pool.query(query, [newBalance, accountId]);
  return result.rows[0];
};

const deleteAccount = async (accountId, userId) => {
  const query = `
    DELETE FROM accounts
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [accountId, userId]);
  return result.rows[0];
};

// ============ SUMMARY ============

const getSummaryByUser = async (userId) => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  const { total_income, total_expense } = result.rows[0];
  const balance = total_income - total_expense;
  
  return {
    totalIncome: Number(total_income),
    totalExpense: Number(total_expense),
    balance: Number(balance)
  };
};

// ============ EXPORTS ============

module.exports = {
  // Users
  pool,
  addUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  setVerificationCode,
  verifyAndActivateByEmail,
  testConnection,
  // Transactions
  getTransactionsByUser,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  // Budgets
  getBudgetsByUser,
  addBudget,
  updateBudget,
  deleteBudget,
  // Accounts
  getAccountsByUser,
  addAccount,
  updateAccount,
  updateAccountBalance,
  deleteAccount,
  // Summary
  getSummaryByUser
};