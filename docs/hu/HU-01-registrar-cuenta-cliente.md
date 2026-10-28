# HU-01 · Registrar cuenta de cliente

**Épica:** Registro y acceso · **Requisito:** RF-01 · **MoSCoW:** Must
**Responsable:** Integrante A (`auth/` y `users/`)
**Rama:** `feature/HU-01-registrar-cuenta-cliente`
**Alcance implementado:** checklist Backend y Frontend de la ficha HU-01 del backlog.

## 1. Criterios de aceptación y evidencia

| Criterio | Estado | Evidencia |
|---|---|---|
| CA-01. El formulario solicita identificación, contacto, correo y contraseña. | Cubierto | `frontend/src/pages/auth/RegisterPage.jsx` (nombre, apellido, teléfono, correo, contraseña y confirmación) |
| CA-02. Valida obligatorios y formato del correo antes de guardar. | Cubierto | Validación en frontend (`validate`) y backend (`backend/src/validators/auth.validator.js`); pruebas de invalidación en `backend/tests/auth.register.test.js` |
| CA-03. Si el correo existe, rechaza el registro sin duplicar la cuenta. | Cubierto | Pre-chequeo + restricción única en base; `EMAIL_ALREADY_EXISTS` (HTTP 409); prueba dedicada y prueba de repositorio |
| CA-04. Con datos válidos crea la cuenta con rol Cliente y confirma el registro. | Cubierto | `POST /api/auth/register` crea con rol `CLIENTE`; pantalla de confirmación en el frontend; prueba de camino exitoso y de intento de escalada de rol |

## 2. Checklist backend (tarjeta HU-01)

- [x] Lógica, validaciones y permisos en servicios y controladores Express.
  - `POST /api/auth/register` público, sin aceptar `rol`/`roleId` desde el cliente.
  - Capas: `routes/` → `controllers/` → `services/` → `repositories/`.
- [x] Contrato `POST /api/auth/register` documentado en `docs/api/openapi.yaml`.
- [x] Persistencia en `users` y `roles` con transacción y `created_at`/`updated_at`.
- [x] Pruebas de camino exitoso, invalidaciones, duplicado, escalada de rol, límite de intentos y error interno.

Comandos:

```bash
cd backend
npm install
npm run db:migrate   # crea roles y users
npm run db:seed      # inserta ADMIN, EMPLEADO y CLIENTE (idempotente)
npm test             # 10 pruebas con node:test
npm run dev
```

## 3. Checklist frontend (tarjeta HU-01)

- [x] Vista **Registro público** en `/registro`.
- [x] Estados: carga (botón bloqueado + spinner), datos válidos (confirmación), error de validación (mensajes por campo), error de servidor (alerta) y vacío (no aplica a un formulario de alta).
- [x] Datos simulados según OpenAPI (`frontend/src/mocks/auth.mocks.js`, activados con `VITE_USE_MOCKS=true`) e integración real mediante `frontend/src/services/api/client.js`.
- [x] Navegación pública, sin guardas de rol, mensajes accesibles (`label`, `aria-invalid`, `aria-describedby`, `role="alert"`) y diseño adaptable.

Comandos:

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev        # http://localhost:5173/registro
```

Para probar sin API: crear `frontend/.env` con `VITE_USE_MOCKS=true`. El correo
`cliente@demo.com` simula CA-03.

## 4. Decisiones asumidas (pendientes de ratificar por el equipo)

1. **ORM:** se usó **Sequelize** porque ya estaba instalado en `backend/package.json`
   junto con `pg` y `sequelize-cli`. El documento pide elegir el ORM antes de
   comenzar (F0-07); falta acta de esa decisión.
2. **Hash de contraseña:** **bcryptjs** (costo 12 configurable con `BCRYPT_ROUNDS`).
   El documento admite Argon2 o bcrypt, pero no fija cuál.
3. **Sesión:** HU-01 **no** emite JWT ni cookie; solo crea la cuenta. La decisión
   JWT vs. sesión pertenece a HU-02/BE-03.
4. **Campos del formulario:** se asumieron `nombre`, `apellido`, `teléfono`,
   `correo` y `contraseña`. El documento no enumera los campos exactos.
5. **Política de contraseña:** 8–72 caracteres, al menos una letra y un número.
   No está especificada en el backlog.
6. **Roles:** valores internos `ADMIN`, `EMPLEADO`, `CLIENTE` según F0-02. La
   etiqueta visible de `ADMIN` es «Administradora»; HU-05 usa «Propietaria/
   Administradora». Falta unificar el nombre.
7. **Correo único:** se normaliza a minúsculas antes de guardar. No se definió
   si el equipo quiere `citext` o índice funcional `lower(email)`.
8. **Tabla `clientes` existente en Neon:** la base actual contiene una tabla
   `clientes` (3 filas) sin roles ni usuarios. Esta HU creó `users` + `roles`
   sin modificar `clientes`. **El equipo debe decidir** si `clientes` se migra,
   se conserva como dato histórico o se elimina; no se tocó.
9. **Mockups UXPilot:** la vista se construyó con el estilo del navbar existente,
   pero no se validó contra frames de UXPilot (F0-09 sigue abierto).

## 5. Puntos pendientes / riesgos

- Añadir el enlace «Crear cuenta» en el navbar compartido. No se modificó
  `frontend/src/App.jsx` porque ese recurso pertenece a otro responsable y debe
  cambiarse por PR acordado. Por ahora la ruta `/registro` es accesible directa.
- El inicio de sesión (`/login`) llegará con HU-02; la pantalla de éxito no
  enlaza a una ruta inexistente.
- El limitador de intentos es en memoria (una instancia). Si se despliega en
  varias instancias, sustituir por un almacén compartido.
- El envío de correo de bienvenida no forma parte de HU-01; corresponde a HU-16
  y a la decisión de canal de F0-05.
- No se agregaron pruebas de frontend con Vitest/RTL: el documento las sugiere
  pero no las exige y el equipo aún no fijó esa herramienta. Se verificó con
  `npm run lint` y `npm run build`.
- La migración se aplicó sobre Neon y se ejecutó una prueba real de registro;
  el usuario de prueba fue eliminado después. Verificar en el PR que nadie más
  haya creado `users`/`roles` en paralelo.

## 6. Definition of Done (estado)

| Regla | Estado |
|---|---|
| CA comprobados y evidenciados | Sí (tabla anterior) |
| PR, sin conflictos ni secretos | Pendiente: rama lista, falta abrir PR y revisión cruzada |
| Pruebas pasan y errores útiles | Sí: 10/10 backend; lint y build frontend |
| Autorización en servidor y navegación coherente | Sí: rol forzado a CLIENTE; ruta pública |
| Datos persistidos y casos de borde | Sí en Neon; duplicado y concurrencia cubiertos |
| API documentada y pantallas contrastadas con mockups | API sí; mockups pendientes de validación F0-09 |
| Responsive/accesibilidad razonables | Sí (media queries, etiquetas, foco, alertas) |
| Tarjeta movida a Done solo tras verificar | Pendiente de revisión del equipo |
