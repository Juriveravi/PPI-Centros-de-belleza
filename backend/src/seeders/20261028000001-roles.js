'use strict';

const ROLES = [
  { name: 'ADMIN', label: 'Administradora' },
  { name: 'EMPLEADO', label: 'Empleado' },
  { name: 'CLIENTE', label: 'Cliente' },
];

module.exports = {
  // Seeder idempotente: puede ejecutarse varias veces sin duplicar roles.
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      'SELECT name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = new Set(existing.map((role) => role.name));
    const pending = ROLES.filter((role) => !existingNames.has(role.name));

    if (pending.length === 0) return;

    const now = new Date();
    await queryInterface.bulkInsert(
      'roles',
      pending.map((role) => ({
        ...role,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      name: { [Sequelize.Op.in]: ROLES.map((role) => role.name) },
    });
  },
};
