const path = require('path');

// El archivo .env vive en la raíz de backend/ y nunca se versiona.
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
});

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toNumber(process.env.PORT, 3000),
  databaseUrl: process.env.DATABASE_URL || '',
  // Neon exige TLS. Se puede desactivar solo en un entorno local controlado.
  dbSsl: process.env.DB_SSL !== 'false',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 12),
  registrationRateLimit: {
    windowMs: toNumber(process.env.REGISTER_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(process.env.REGISTER_RATE_LIMIT_MAX, 10),
  },
};
