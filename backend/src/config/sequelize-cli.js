const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
});

const useSsl = process.env.DB_SSL !== 'false';

const common = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: common,
  test: common,
  production: common,
};
