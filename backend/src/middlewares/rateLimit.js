const { RateLimitError } = require('../errors/AppError');

/**
 * Limitador de intentos en memoria, suficiente para una sola instancia.
 * Si el equipo escala a varias instancias, reemplazar por un almacén
 * compartido (por ejemplo Redis) como parte de BE-03.
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  const hits = new Map();

  function prune(now) {
    if (hits.size < 5000) return;
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    prune(now);

    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return next(
        new RateLimitError(
          'Demasiados intentos de registro. Espera unos minutos e intenta de nuevo.',
          retryAfter
        )
      );
    }

    return next();
  };
}

module.exports = { createRateLimiter };
