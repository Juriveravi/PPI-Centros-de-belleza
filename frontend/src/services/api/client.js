const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

export class ApiError extends Error {
  constructor({ message, code = 'REQUEST_FAILED', status = 0, details } = {}) {
    super(message || 'No se pudo completar la solicitud.')
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const hasBody = body !== undefined

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error

    throw new ApiError({
      code: 'NETWORK_ERROR',
      message:
        'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
    })
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: payload?.error?.code || 'REQUEST_FAILED',
      message:
        payload?.error?.message || 'No se pudo completar la solicitud.',
      details: payload?.error?.details,
    })
  }

  return payload
}
