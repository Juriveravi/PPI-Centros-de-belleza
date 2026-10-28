const { ValidationError } = require('../errors/AppError');

const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Valida y normaliza el cuerpo de POST /api/auth/register.
 * Las reglas reflejan los criterios CA-01 y CA-02 de HU-01.
 */
function validateRegisterPayload(body = {}) {
  const errors = [];

  const nombre = asTrimmedString(body.nombre).replace(/\s+/g, ' ');
  const apellido = asTrimmedString(body.apellido).replace(/\s+/g, ' ');
  const telefono = asTrimmedString(body.telefono);
  const correo = asTrimmedString(body.correo).toLowerCase();
  const contrasena = typeof body.contrasena === 'string' ? body.contrasena : '';

  if (!nombre) {
    errors.push({ field: 'nombre', message: 'El nombre es obligatorio.' });
  } else if (nombre.length < 2 || nombre.length > 60) {
    errors.push({ field: 'nombre', message: 'El nombre debe tener entre 2 y 60 caracteres.' });
  } else if (!NAME_PATTERN.test(nombre)) {
    errors.push({ field: 'nombre', message: 'El nombre contiene caracteres no válidos.' });
  }

  if (!apellido) {
    errors.push({ field: 'apellido', message: 'El apellido es obligatorio.' });
  } else if (apellido.length < 2 || apellido.length > 60) {
    errors.push({ field: 'apellido', message: 'El apellido debe tener entre 2 y 60 caracteres.' });
  } else if (!NAME_PATTERN.test(apellido)) {
    errors.push({ field: 'apellido', message: 'El apellido contiene caracteres no válidos.' });
  }

  if (!telefono) {
    errors.push({ field: 'telefono', message: 'El teléfono de contacto es obligatorio.' });
  } else {
    const digits = telefono.replace(/\D/g, '');
    if (!/^\+?[\d\s()-]+$/.test(telefono)) {
      errors.push({ field: 'telefono', message: 'El teléfono contiene caracteres no válidos.' });
    } else if (digits.length < 7 || digits.length > 15) {
      errors.push({ field: 'telefono', message: 'El teléfono debe tener entre 7 y 15 dígitos.' });
    }
  }

  if (!correo) {
    errors.push({ field: 'correo', message: 'El correo electrónico es obligatorio.' });
  } else if (correo.length > 120) {
    errors.push({ field: 'correo', message: 'El correo electrónico no puede superar 120 caracteres.' });
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.push({ field: 'correo', message: 'El correo electrónico no tiene un formato válido.' });
  }

  if (!contrasena) {
    errors.push({ field: 'contrasena', message: 'La contraseña es obligatoria.' });
  } else if (contrasena.length < 8 || contrasena.length > 72) {
    errors.push({ field: 'contrasena', message: 'La contraseña debe tener entre 8 y 72 caracteres.' });
  } else if (!/\p{L}/u.test(contrasena) || !/\d/.test(contrasena)) {
    errors.push({
      field: 'contrasena',
      message: 'La contraseña debe incluir al menos una letra y un número.',
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Revisa los datos del formulario.', errors);
  }

  // Se devuelve una lista explícita de campos: cualquier dato adicional
  // (por ejemplo "rol") se descarta y no puede alterar la asignación de rol.
  return { nombre, apellido, telefono, correo, contrasena };
}

module.exports = { validateRegisterPayload };
