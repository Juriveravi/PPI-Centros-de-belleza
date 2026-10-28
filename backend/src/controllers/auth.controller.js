function createAuthController({ authService }) {
  return {
    async register(req, res) {
      const user = await authService.registerClient(req.validated);

      return res.status(201).json({
        data: user,
        message: 'Cuenta creada correctamente.',
      });
    },
  };
}

module.exports = { createAuthController };
