import { registerClient as registerRequest } from './api/auth.api.js'
import { mockRegister } from '../mocks/auth.mocks.js'

export const isMockMode =
  String(import.meta.env.VITE_USE_MOCKS).toLowerCase() === 'true'

export function registerClient(payload) {
  return isMockMode ? mockRegister(payload) : registerRequest(payload)
}
