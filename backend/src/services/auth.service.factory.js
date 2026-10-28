const env = require('../config/env');
const { createUserRepository } = require('../repositories/user.repository');
const { createAuthService } = require('./auth.service');
const { createPasswordHasher } = require('./password');

/**
 * Construye el servicio con sus dependencias reales. Se carga de forma
 * diferida para que las pruebas puedan inyectar dobles sin abrir conexión
 * a Neon.
 */
function createDefaultAuthService() {
  const { getModels } = require('../models');
  const { Role, User, sequelize } = getModels();

  const userRepository = createUserRepository({ User, Role, sequelize });
  const passwordHasher = createPasswordHasher({ rounds: env.bcryptRounds });

  return createAuthService({ userRepository, passwordHasher });
}

module.exports = { createDefaultAuthService };
