const { ROLES, ROLE_LABELS } = require('../config/roles');
const { EmailAlreadyExistsError } = require('../errors/AppError');

function createUserRepository({ User, Role, sequelize }) {
  async function findByEmail(email) {
    return User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    });
  }

  async function createClientAccount({
    firstName,
    lastName,
    phone,
    email,
    passwordHash,
  }) {
    try {
      return await sequelize.transaction(async (transaction) => {
        // El rol CLIENTE se resuelve en el servidor. Aunque la base se
        // inicialice vacía, el registro no depende de un seeder previo.
        const [role] = await Role.findOrCreate({
          where: { name: ROLES.CLIENTE },
          defaults: {
            name: ROLES.CLIENTE,
            label: ROLE_LABELS[ROLES.CLIENTE],
          },
          transaction,
        });

        const user = await User.create(
          {
            firstName,
            lastName,
            phone,
            email,
            passwordHash,
            roleId: role.id,
            isActive: true,
          },
          { transaction }
        );

        return {
          ...user.get({ plain: true }),
          role: role.get({ plain: true }),
        };
      });
    } catch (error) {
      // Condición de carrera: dos registros simultáneos con el mismo correo.
      if (error?.name === 'SequelizeUniqueConstraintError') {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }
  }

  return { findByEmail, createClientAccount };
}

module.exports = { createUserRepository };
