class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

class ValidationError extends AppError {
  constructor(message = 'Revisa los datos enviados.', details) {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, { status: 409, code });
  }
}

class EmailAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      'Ya existe una cuenta registrada con este correo electrónico.',
      'EMAIL_ALREADY_EXISTS'
    );
  }
}

class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no existe.', code = 'NOT_FOUND') {
    super(message, { status: 404, code });
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Demasiados intentos. Intenta nuevamente más tarde.', retryAfter) {
    super(message, { status: 429, code: 'RATE_LIMIT_EXCEEDED' });
    this.retryAfter = retryAfter;
  }
}

module.exports = {
  AppError,
  ValidationError,
  ConflictError,
  EmailAlreadyExistsError,
  NotFoundError,
  RateLimitError,
};
