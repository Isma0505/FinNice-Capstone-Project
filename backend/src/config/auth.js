module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  TOKEN_EXPIRY: '24h',
  SALT_ROUNDS: 10
};
