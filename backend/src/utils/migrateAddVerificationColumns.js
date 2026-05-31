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

(async () => {
  try {
    console.log('Menjalankan migrasi kolom verifikasi email...');

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code varchar(64)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires timestamp`);

    console.log('Kolom verifikasi siap');
    process.exit(0);
  } catch (err) {
    console.error('Migrasi gagal:', err.message || err);
    process.exit(1);
  }
})();
