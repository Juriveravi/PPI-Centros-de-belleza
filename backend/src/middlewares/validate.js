function validate(schema) {
  return function validateRequestBody(req, res, next) {
    try {
      req.validated = schema(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { validate };
