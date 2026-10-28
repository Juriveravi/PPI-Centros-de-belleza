import { apiRequest } from './client.js'

export function registerClient(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  })
}
