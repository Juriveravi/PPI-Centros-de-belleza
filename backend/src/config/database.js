const { Sequelize } = require('sequelize');
const env = require('./env');

function buildDialectOptions() {
  if (!env.dbSsl) return {};
  return { ssl: { require: true, rejectUnauthorized: false } };
}

// La conexión se crea solo si DATABASE_URL existe. Esto permite ejecutar
// pruebas unitarias con repositorios simulados sin tocar Neon.
let sequelize = null;

if (env.databaseUrl) {
  sequelize = new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: buildDialectOptions(),
    define: {
      underscored: true,
      timestamps: true,
    },
  });
}

function requireSequelize() {
  if (!sequelize) {
    throw new Error(
      'DATABASE_URL no está configurada. Copia backend/.env.example a backend/.env y define la cadena de conexión de Neon.'
    );
  }
  return sequelize;
}

module.exports = { sequelize, requireSequelize, buildDialectOptions };
