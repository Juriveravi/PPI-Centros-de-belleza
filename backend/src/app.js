const express = require('express');
const env = require('./config/env');
const { createAuthController } = require('./controllers/auth.controller');
const { createCorsMiddleware } = require('./middlewares/cors');
const { createErrorHandler } = require('./middlewares/errorHandler');
const { notFound } = require('./middlewares/notFound');
const { createRateLimiter } = require('./middlewares/rateLimit');
const { createAuthRouter } = require('./routes/auth.routes');
const { createRouter } = require('./routes');
const { createDefaultAuthService } = require('./services/auth.service.factory');

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
}

/**
 * Fábrica de la aplicación Express. Permite inyectar servicios y límites
 * en pruebas sin depender de PostgreSQL.
 */
function createApp(options = {}) {
  const authService = options.authService || createDefaultAuthService();
  const logger = options.logger === undefined ? console : options.logger;
  const rateLimitOptions = options.rateLimit || env.registrationRateLimit;

  const app = express();
  app.disable('x-powered-by');

  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(securityHeaders);
  app.use(createCorsMiddleware({ allowedOrigins: env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  const authController = createAuthController({ authService });
  const authRouter = createAuthRouter({
    authController,
    registrationRateLimiter: createRateLimiter(rateLimitOptions),
  });

  app.use(createRouter({ authRouter }));

  app.use(notFound);
  app.use(createErrorHandler({ logger }));

  return app;
}

module.exports = { createApp };
