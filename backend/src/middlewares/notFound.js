function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `La ruta ${req.method} ${req.originalUrl} no existe.`,
    },
  });
}

module.exports = { notFound };
