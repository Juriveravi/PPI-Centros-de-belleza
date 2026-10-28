const { AppError } = require('../errors/AppError');

function createErrorHandler({ logger = console } = {}) {
  return function errorHandler(err, req, res, next) {
    // Express exige la firma de 4 argumentos para reconocer el handler.
    if (res.headersSent) return next(err);

    if (err instanceof AppError) {
      if (err.retryAfter) res.setHeader('Retry-After', String(err.retryAfter));
      return res.status(err.status).json({ error: err.toJSON() });
    }

    // JSON mal formado enviado por el cliente.
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: {
          code: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud no es un JSON válido.',
        },
      });
    }

    if (logger) {
      logger.error('[api] Error no controlado:', err);
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado. Intenta nuevamente.',
      },
    });
  };
}

module.exports = { createErrorHandler };
