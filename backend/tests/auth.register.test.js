const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createApp } = require('../src/app');
const { ROLES } = require('../src/config/roles');
const { createAuthService } = require('../src/services/auth.service');
const { createPasswordHasher } = require('../src/services/password');

function createFakeRepository(seed = []) {
  const users = [...seed];

  return {
    users,
    async findByEmail(email) {
      return users.find((user) => user.email === email) || null;
    },
    async createClientAccount(data) {
      const user = {
        id: users.length + 1,
        ...data,
        role: { name: ROLES.CLIENTE },
        createdAt: new Date('2026-10-28T12:00:00.000Z'),
      };
      users.push(user);
      return user;
    },
  };
}

function buildApp({ repository = createFakeRepository(), rateLimit } = {}) {
  const hasher = createPasswordHasher({ rounds: 4 });
  const authService = createAuthService({
    userRepository: repository,
    passwordHasher: hasher,
  });

  const app = createApp({
    authService,
    logger: null,
    rateLimit: rateLimit || { windowMs: 60_000, max: 50 },
  });

  return { app, repository, hasher };
}

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  try {
    return await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function validPayload(overrides = {}) {
  return {
    nombre: 'María',
    apellido: 'Salomé',
    telefono: '+57 300 123 4567',
    correo: 'maria@example.com',
    contrasena: 'Belleza2026',
    ...overrides,
  };
}

function postRegister(baseUrl, body) {
  return fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('HU-01 · POST /api/auth/register', () => {
  test('CA-04: registra un cliente con rol CLIENTE y contraseña cifrada', async () => {
    const { app, repository, hasher } = buildApp();

    await withServer(app, async (baseUrl) => {
      const response = await postRegister(
        baseUrl,
        validPayload({ correo: '  Maria@Example.COM ' })
      );
      const body = await response.json();

      assert.equal(response.status, 201);
      assert.equal(body.message, 'Cuenta creada correctamente.');
      assert.equal(body.data.rol, ROLES.CLIENTE);
      assert.equal(body.data.correo, 'maria@example.com');
      assert.equal(body.data.nombre, 'María');
      assert.equal(body.data.apellido, 'Salomé');
      assert.equal(body.data.contrasena, undefined);
      assert.equal(body.data.passwordHash, undefined);

      const stored = repository.users[0];
      assert.equal(stored.email, 'maria@example.com');
      assert.notEqual(stored.passwordHash, 'Belleza2026');
      assert.ok(await hasher.compare('Belleza2026', stored.passwordHash));
    });
  });

  test('CA-02: rechaza campos obligatorios vacíos, correo inválido y contraseña débil', async () => {
    const cases = [
      { payload: validPayload({ nombre: '' }), field: 'nombre' },
      { payload: validPayload({ apellido: '   ' }), field: 'apellido' },
      { payload: validPayload({ telefono: '' }), field: 'telefono' },
      { payload: validPayload({ telefono: 'abc' }), field: 'telefono' },
      { payload: validPayload({ correo: 'maria@' }), field: 'correo' },
      { payload: validPayload({ correo: '' }), field: 'correo' },
      { payload: validPayload({ contrasena: 'corta1' }), field: 'contrasena' },
      { payload: validPayload({ contrasena: 'sinNumeros' }), field: 'contrasena' },
    ];

    const { app, repository } = buildApp();

    await withServer(app, async (baseUrl) => {
      for (const item of cases) {
        const response = await postRegister(baseUrl, item.payload);
        const body = await response.json();

        assert.equal(response.status, 400, JSON.stringify(item.payload));
        assert.equal(body.error.code, 'VALIDATION_ERROR');
        assert.ok(
          body.error.details.some((detail) => detail.field === item.field),
          `Se esperaba un error en el campo ${item.field}: ${JSON.stringify(body)}`
        );
      }

      assert.equal(repository.users.length, 0);
    });
  });

  test('CA-03: rechaza un correo ya registrado sin duplicar la cuenta', async () => {
    const repository = createFakeRepository([
      {
        id: 99,
        firstName: 'Otra',
        lastName: 'Persona',
        phone: '3000000000',
        email: 'maria@example.com',
        passwordHash: 'hash-existente',
        role: { name: ROLES.CLIENTE },
      },
    ]);
    const { app } = buildApp({ repository });

    await withServer(app, async (baseUrl) => {
      const response = await postRegister(
        baseUrl,
        validPayload({ correo: 'MARIA@EXAMPLE.COM' })
      );
      const body = await response.json();

      assert.equal(response.status, 409);
      assert.equal(body.error.code, 'EMAIL_ALREADY_EXISTS');
      assert.equal(repository.users.length, 1);
    });
  });

  test('CA-04: ignora intentos de asignar otro rol desde el cuerpo', async () => {
    const { app, repository } = buildApp();

    await withServer(app, async (baseUrl) => {
      const response = await postRegister(baseUrl, {
        ...validPayload(),
        rol: 'ADMIN',
        roleId: 1,
        isActive: false,
      });
      const body = await response.json();

      assert.equal(response.status, 201);
      assert.equal(body.data.rol, ROLES.CLIENTE);

      const stored = repository.users[0];
      assert.equal(stored.role.name, ROLES.CLIENTE);
      assert.equal(stored.roleId, undefined);
      assert.equal(stored.isActive, undefined);
    });
  });

  test('limita intentos repetidos de registro con HTTP 429', async () => {
    const { app } = buildApp({
      rateLimit: { windowMs: 60_000, max: 2 },
    });

    await withServer(app, async (baseUrl) => {
      const first = await postRegister(baseUrl, validPayload({ correo: 'a@example.com' }));
      const second = await postRegister(baseUrl, validPayload({ correo: 'b@example.com' }));
      const third = await postRegister(baseUrl, validPayload({ correo: 'c@example.com' }));

      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      assert.equal(third.status, 429);
      assert.ok(Number(third.headers.get('retry-after')) >= 1);

      const body = await third.json();
      assert.equal(body.error.code, 'RATE_LIMIT_EXCEEDED');
    });
  });

  test('no filtra detalles internos cuando ocurre un error inesperado', async () => {
    const app = createApp({
      authService: {
        async registerClient() {
          throw new Error('fallo interno con datos sensibles');
        },
      },
      logger: null,
      rateLimit: { windowMs: 60_000, max: 50 },
    });

    await withServer(app, async (baseUrl) => {
      const response = await postRegister(baseUrl, validPayload());
      const body = await response.json();

      assert.equal(response.status, 500);
      assert.equal(body.error.code, 'INTERNAL_ERROR');
      assert.equal(body.error.message.includes('sensibles'), false);
    });
  });

  test('responde 404 en JSON para rutas desconocidas', async () => {
    const { app } = buildApp();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/no-existe`);
      const body = await response.json();

      assert.equal(response.status, 404);
      assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
    });
  });

  test('permite el preflight CORS del origen configurado', async () => {
    const { app } = buildApp();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
        },
      });

      assert.equal(response.status, 204);
      assert.equal(
        response.headers.get('access-control-allow-origin'),
        'http://localhost:5173'
      );
    });
  });
});
