const { test } = require('node:test');
const assert = require('node:assert/strict');

const { ROLES } = require('../src/config/roles');
const { EmailAlreadyExistsError } = require('../src/errors/AppError');
const { createUserRepository } = require('../src/repositories/user.repository');

function buildFakeModels({ create } = {}) {
  const role = {
    id: 3,
    name: ROLES.CLIENTE,
    get: () => ({ id: 3, name: ROLES.CLIENTE, label: 'Cliente' }),
  };

  const calls = {};

  const Role = {
    async findOrCreate(options) {
      calls.findOrCreate = options;
      return [role, true];
    },
  };

  const User = {
    async create(values, options) {
      calls.create = { values, options };
      if (create) return create(values, options);
      return {
        ...values,
        id: 10,
        createdAt: new Date('2026-10-28T12:00:00.000Z'),
        get() {
          return { ...values, id: 10, createdAt: this.createdAt };
        },
      };
    },
  };

  const sequelize = {
    async transaction(callback) {
      return callback('transaction-fake');
    },
  };

  return { User, Role, sequelize, calls };
}

test('createClientAccount crea la cuenta dentro de una transacción con rol CLIENTE', async () => {
  const { User, Role, sequelize, calls } = buildFakeModels();
  const repository = createUserRepository({ User, Role, sequelize });

  const user = await repository.createClientAccount({
    firstName: 'María',
    lastName: 'Salomé',
    phone: '3001234567',
    email: 'maria@example.com',
    passwordHash: 'hash',
  });

  assert.equal(user.email, 'maria@example.com');
  assert.equal(user.role.name, ROLES.CLIENTE);
  assert.equal(calls.findOrCreate.where.name, ROLES.CLIENTE);
  assert.equal(calls.create.options.transaction, 'transaction-fake');
  assert.equal(calls.create.values.roleId, 3);
});

test('createClientAccount traduce la violación de unicidad a EMAIL_ALREADY_EXISTS', async () => {
  const duplicate = new Error('duplicate key value violates unique constraint');
  duplicate.name = 'SequelizeUniqueConstraintError';

  const { User, Role, sequelize } = buildFakeModels({
    create: async () => {
      throw duplicate;
    },
  });

  const repository = createUserRepository({ User, Role, sequelize });

  await assert.rejects(
    () =>
      repository.createClientAccount({
        firstName: 'María',
        lastName: 'Salomé',
        phone: '3001234567',
        email: 'maria@example.com',
        passwordHash: 'hash',
      }),
    (error) => {
      assert.ok(error instanceof EmailAlreadyExistsError);
      assert.equal(error.status, 409);
      assert.equal(error.code, 'EMAIL_ALREADY_EXISTS');
      return true;
    }
  );
});
