const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finnice_app'
});

pool.on('connect', () => {
  console.log('✓ Terhubung ke PostgreSQL');
});

pool.on('error', (error) => {
  console.error('❌ Error connection pool:', error);
});

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

module.exports = {
  pool,
  addUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  setVerificationCode,
  verifyAndActivateByEmail,
  testConnection
};
