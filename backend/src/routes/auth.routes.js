const express = require('express');
const { validate } = require('../middlewares/validate');
const { validateRegisterPayload } = require('../validators/auth.validator');

function createAuthRouter({ authController, registrationRateLimiter }) {
  const router = express.Router();

  router.post(
    '/register',
    registrationRateLimiter,
    validate(validateRegisterPayload),
    authController.register
  );

  return router;
}

module.exports = { createAuthRouter };
