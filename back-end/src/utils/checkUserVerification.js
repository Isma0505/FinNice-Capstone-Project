const db = require('../config/database');
(async () => {
  try {
    const res = await db.pool.query('SELECT id, email, email_verified, verification_code, verification_expires FROM users ORDER BY id DESC LIMIT 5');
    console.log(res.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
