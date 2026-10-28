import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../services/api/client.js'
import { isMockMode, registerClient } from '../../services/auth.js'
import './RegisterPage.css'

const INITIAL_VALUES = {
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
}

// Mismas reglas que backend/src/validators/auth.validator.js (CA-02).
const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function validate(values) {
  const errors = {}
  const nombre = normalizeName(values.nombre)
  const apellido = normalizeName(values.apellido)
  const telefono = values.telefono.trim()
  const correo = values.correo.trim()
  const contrasena = values.contrasena

  if (!nombre) {
    errors.nombre = 'Ingresa tu nombre.'
  } else if (nombre.length < 2 || nombre.length > 60) {
    errors.nombre = 'El nombre debe tener entre 2 y 60 caracteres.'
  } else if (!NAME_PATTERN.test(nombre)) {
    errors.nombre = 'El nombre contiene caracteres no válidos.'
  }

  if (!apellido) {
    errors.apellido = 'Ingresa tu apellido.'
  } else if (apellido.length < 2 || apellido.length > 60) {
    errors.apellido = 'El apellido debe tener entre 2 y 60 caracteres.'
  } else if (!NAME_PATTERN.test(apellido)) {
    errors.apellido = 'El apellido contiene caracteres no válidos.'
  }

  if (!telefono) {
    errors.telefono = 'Ingresa un teléfono de contacto.'
  } else {
    const digits = telefono.replace(/\D/g, '')
    if (!/^\+?[\d\s()-]+$/.test(telefono)) {
      errors.telefono = 'El teléfono contiene caracteres no válidos.'
    } else if (digits.length < 7 || digits.length > 15) {
      errors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos.'
    }
  }

  if (!correo) {
    errors.correo = 'Ingresa tu correo electrónico.'
  } else if (correo.length > 120) {
    errors.correo = 'El correo no puede superar 120 caracteres.'
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.correo = 'Ingresa un correo electrónico válido.'
  }

  if (!contrasena) {
    errors.contrasena = 'Crea una contraseña.'
  } else if (contrasena.length < 8 || contrasena.length > 72) {
    errors.contrasena = 'La contraseña debe tener entre 8 y 72 caracteres.'
  } else if (!/\p{L}/u.test(contrasena) || !/\d/.test(contrasena)) {
    errors.contrasena = 'Incluye al menos una letra y un número.'
  }

  if (!values.confirmarContrasena) {
    errors.confirmarContrasena = 'Confirma tu contraseña.'
  } else if (values.confirmarContrasena !== contrasena) {
    errors.confirmarContrasena = 'Las contraseñas no coinciden.'
  }

  return errors
}

function focusField(field) {
  if (!field) return
  document.getElementById(`register-${field}`)?.focus()
}

function TextField({ id, label, error, hint, ...inputProps }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`register-field${error ? ' register-field--invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && (
        <p className="register-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="register-field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

function RegisterPage() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [status, setStatus] = useState('idle')
  const [createdUser, setCreatedUser] = useState(null)

  const isSubmitting = status === 'submitting'

  function handleChange(event) {
    const { name, value } = event.target

    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
    if (serverError) setServerError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setServerError('')
      focusField(Object.keys(nextErrors)[0])
      return
    }

    setStatus('submitting')
    setErrors({})
    setServerError('')

    try {
      const response = await registerClient({
        nombre: normalizeName(values.nombre),
        apellido: normalizeName(values.apellido),
        telefono: values.telefono.trim(),
        correo: values.correo.trim().toLowerCase(),
        contrasena: values.contrasena,
      })

      setCreatedUser(response.data)
      setStatus('success')
    } catch (error) {
      setStatus('idle')

      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setErrors({ correo: error.message })
        focusField('correo')
        return
      }

      if (error instanceof ApiError) {
        const fieldErrors = {}
        if (Array.isArray(error.details)) {
          for (const detail of error.details) {
            if (detail?.field && detail.field in INITIAL_VALUES) {
              fieldErrors[detail.field] = detail.message
            }
          }
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          focusField(Object.keys(fieldErrors)[0])
        }

        setServerError(error.message)
        return
      }

      setServerError('Ocurrió un error inesperado. Intenta nuevamente.')
    }
  }

  return (
    <div className="register-page">
      <header className="register-header">
        <Link className="register-brand" to="/">
          <span className="register-brand-mark" aria-hidden="true">
            CB
          </span>
          <span className="register-brand-copy">
            <strong>Centro Belleza</strong>
            <small>María Salomé</small>
          </span>
        </Link>
        <Link className="register-back" to="/">
          Volver al inicio
        </Link>
      </header>

      <main className="register-main">
        <section className="register-intro" aria-labelledby="register-title">
          <p className="register-eyebrow">Registro de clientes</p>
          <h1 id="register-title">Tu momento empieza aquí.</h1>
          <p className="register-lead">
            Crea tu cuenta para reservar tus citas y mantener tus datos de
            contacto siempre al día.
          </p>
          <ul className="register-benefits">
            <li>Reserva en línea de forma sencilla.</li>
            <li>Consulta y actualiza tus datos cuando quieras.</li>
            <li>Recibe el acompañamiento del centro en cada cita.</li>
          </ul>
        </section>

        <section className="register-card" aria-labelledby="register-form-title">
          {status === 'success' ? (
            <div className="register-success" role="status" aria-live="polite">
              <span className="register-success-icon" aria-hidden="true">
                ✓
              </span>
              <h2 id="register-form-title">¡Cuenta creada!</h2>
              <p>
                Registramos correctamente{' '}
                <strong>{createdUser?.correo}</strong> con el rol{' '}
                <strong>Cliente</strong>.
              </p>
              <p className="register-success-note">
                Tu cuenta ya está lista. Desde aquí podrás gestionar tus
                próximas citas.
              </p>
              <Link className="register-submit register-submit--link" to="/">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <div className="register-card-heading">
                <h2 id="register-form-title">Crea tu cuenta</h2>
                <p>Solo necesitamos tus datos de contacto.</p>
              </div>

              {serverError && (
                <div className="register-alert" role="alert">
                  {serverError}
                </div>
              )}

              <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
                aria-busy={isSubmitting}
              >
                <div className="register-name-grid">
                  <TextField
                    id="register-nombre"
                    label="Nombre"
                    name="nombre"
                    value={values.nombre}
                    onChange={handleChange}
                    error={errors.nombre}
                    autoComplete="given-name"
                    maxLength={60}
                    required
                  />
                  <TextField
                    id="register-apellido"
                    label="Apellido"
                    name="apellido"
                    value={values.apellido}
                    onChange={handleChange}
                    error={errors.apellido}
                    autoComplete="family-name"
                    maxLength={60}
                    required
                  />
                </div>

                <TextField
                  id="register-telefono"
                  label="Teléfono de contacto"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  value={values.telefono}
                  onChange={handleChange}
                  error={errors.telefono}
                  autoComplete="tel"
                  placeholder="+57 300 123 4567"
                  maxLength={20}
                  required
                />

                <TextField
                  id="register-correo"
                  label="Correo electrónico"
                  name="correo"
                  type="email"
                  inputMode="email"
                  value={values.correo}
                  onChange={handleChange}
                  error={errors.correo}
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  maxLength={120}
                  required
                />

                <TextField
                  id="register-contrasena"
                  label="Contraseña"
                  name="contrasena"
                  type="password"
                  value={values.contrasena}
                  onChange={handleChange}
                  error={errors.contrasena}
                  hint="Mínimo 8 caracteres, con al menos una letra y un número."
                  autoComplete="new-password"
                  maxLength={72}
                  required
                />

                <TextField
                  id="register-confirmarContrasena"
                  label="Confirmar contraseña"
                  name="confirmarContrasena"
                  type="password"
                  value={values.confirmarContrasena}
                  onChange={handleChange}
                  error={errors.confirmarContrasena}
                  autoComplete="new-password"
                  maxLength={72}
                  required
                />

                <button
                  className="register-submit"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="register-spinner" aria-hidden="true" />
                      Creando cuenta…
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </form>

              {isMockMode && (
                <p className="register-mock-hint">
                  Modo demostración con datos simulados. Usa{' '}
                  <code>cliente@demo.com</code> para ver el error de correo
                  duplicado.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="register-footer">
        <p>© {new Date().getFullYear()} Centro de Belleza María Salomé</p>
      </footer>
    </div>
  )
}

export default RegisterPage
