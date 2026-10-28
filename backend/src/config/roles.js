// Roles acordados en F0-02. El rol nunca se recibe desde el cliente:
// el registro público siempre crea cuentas CLIENTE.
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EMPLEADO: 'EMPLEADO',
  CLIENTE: 'CLIENTE',
});

const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Administradora',
  [ROLES.EMPLEADO]: 'Empleado',
  [ROLES.CLIENTE]: 'Cliente',
});

module.exports = { ROLES, ROLE_LABELS };
