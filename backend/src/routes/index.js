const express = require('express');

function createRouter({ authRouter }) {
  const router = express.Router();

  router.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  router.use('/api/auth', authRouter);

  return router;
}

module.exports = { createRouter };
