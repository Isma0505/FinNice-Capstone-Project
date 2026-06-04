const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Membuat tabel-tabel database...\n');

    // Tabel users
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(64),
        verification_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Tabel transactions
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount BIGINT NOT NULL,
        date DATE NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Tabel budgets
    const createBudgetsTable = `
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        limit_amount BIGINT NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Tabel accounts
    const createAccountsTable = `
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(50),
        account_number VARCHAR(100),
        balance BIGINT DEFAULT 0,
        icon VARCHAR(50),
        color VARCHAR(20),
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.pool.query(createUsersTable);
    console.log('✓ Tabel users siap');

    await db.pool.query(createTransactionsTable);
    console.log('✓ Tabel transactions siap');

    await db.pool.query(createBudgetsTable);
    console.log('✓ Tabel budgets siap');

    await db.pool.query(createAccountsTable);
    console.log('✓ Tabel accounts siap');

    console.log('\n✅ Semua tabel berhasil dibuat!');
    console.log('\nLangkah berikutnya:');
    console.log('  1. Jalankan server: npm run dev');
    console.log('  2. Test registrasi: POST /auth/register');
    console.log('  3. Test login: POST /auth/login\n');

    process.exit(0);
  } catch (error) {
    console.error('Error setup database:', error.message);
    console.log('\nCek ini:');
    console.log('  1. Cek .env file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.log('  2. Pastikan PostgreSQL sudah running');
    console.log('  3. Pastikan database sudah dibuat di PostgreSQL');
    console.log('  4. Cek username dan password PostgreSQL di .env\n');
    process.exit(1);
  }
};

setupDatabase();