import { ApiError } from '../services/api/client.js'

const DEMO_LATENCY_MS = 700
const registeredEmails = new Set(['cliente@demo.com'])

/**
 * Simulación de POST /api/auth/register conforme al contrato OpenAPI
 * (docs/api/openapi.yaml). Permite trabajar la vista antes de conectar
 * la API real, tal como propone FE-04.
 */
export function mockRegister(payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const correo = String(payload.correo || '').trim().toLowerCase()

      if (registeredEmails.has(correo)) {
        reject(
          new ApiError({
            status: 409,
            code: 'EMAIL_ALREADY_EXISTS',
            message:
              'Ya existe una cuenta registrada con este correo electrónico.',
          })
        )
        return
      }

      registeredEmails.add(correo)

      resolve({
        data: {
          id: Date.now(),
          nombre: payload.nombre,
          apellido: payload.apellido,
          correo,
          telefono: payload.telefono,
          rol: 'CLIENTE',
          creadoEn: new Date().toISOString(),
        },
        message: 'Cuenta creada correctamente.',
      })
    }, DEMO_LATENCY_MS)
  })
}
