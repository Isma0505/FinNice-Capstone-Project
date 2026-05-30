const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Membuat tabel users...\n');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.pool.query(createTableQuery);
    console.log('Tabel users berhasil dibuat\n');

    const tableInfoQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users';
    `;

    const tableInfo = await db.pool.query(tableInfoQuery);

    console.log('Struktur tabel users:\n');
    console.log('Column Name       | Data Type            | Nullable');
    console.log('-' + '-'.repeat(58));

    tableInfo.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'YES' : 'NO';
      console.log(`${row.column_name.padEnd(17)}| ${row.data_type.padEnd(20)}| ${nullable}`);
    });

    console.log('\nDatabase setup selesai');
    console.log('\nLangkah berikutnya:\n');
    console.log('  1. Jalankan server: npm run dev');
    console.log('  2. Test registrasi: POST /auth/register');
    console.log('  3. Test login: POST /auth/login\n');

    process.exit(0);
  } catch (error) {
    console.error('Error setup database:', error.message);
    console.log('\nCek ini:');
    console.log('  1. Cek .env file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.log('  2. Pastikan PostgreSQL sudah running');
    console.log('  3. Pastikan database "finnice_App" sudah dibuat di PostgreSQL');
    console.log('  4. Cek username dan password PostgreSQL di .env\n');
    process.exit(1);
  }
};

setupDatabase();
