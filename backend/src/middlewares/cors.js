function createCorsMiddleware({ allowedOrigins = [] } = {}) {
  const allowAll = allowedOrigins.includes('*');

  return function cors(req, res, next) {
    const origin = req.headers.origin;

    if (origin && (allowAll || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', allowAll ? '*' : origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '600');
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  };
}

module.exports = { createCorsMiddleware };
