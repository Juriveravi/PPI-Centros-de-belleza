const { createApp } = require('./app');
const { sequelize } = require('./config/database');
const env = require('./config/env');

async function start() {
  if (!sequelize) {
    console.error(
      'No se puede iniciar la API: define DATABASE_URL en backend/.env (ver .env.example).'
    );
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL (Neon) establecida.');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exitCode = 1;
    return;
  }

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`);
  });
}

start();
