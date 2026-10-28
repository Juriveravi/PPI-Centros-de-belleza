const { ROLES } = require('../config/roles');
const { EmailAlreadyExistsError } = require('../errors/AppError');

function toPublicUser(user) {
  return {
    id: user.id,
    nombre: user.firstName,
    apellido: user.lastName,
    correo: user.email,
    telefono: user.phone,
    rol: user.role?.name || ROLES.CLIENTE,
    creadoEn: user.createdAt
      ? new Date(user.createdAt).toISOString()
      : undefined,
  };
}

function createAuthService({ userRepository, passwordHasher }) {
  async function registerClient(input) {
    const correo = input.correo.trim().toLowerCase();

    const existing = await userRepository.findByEmail(correo);
    if (existing) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await passwordHasher.hash(input.contrasena);

    const user = await userRepository.createClientAccount({
      firstName: input.nombre.replace(/\s+/g, ' '),
      lastName: input.apellido.replace(/\s+/g, ' '),
      phone: input.telefono,
      email: correo,
      passwordHash,
    });

    return toPublicUser(user);
  }

  return { registerClient };
}

module.exports = { createAuthService, toPublicUser };
