import { useState } from 'react'
import './App.css'

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Profesionales', href: '#profesionales' },
  { label: 'Contacto', href: '#contacto' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
          <header className="site-header">
            <nav className="navbar" aria-label="Navegación principal">
              <a className="brand" href="#inicio" onClick={closeMenu}>
                <span className="brand-mark" aria-hidden="true">CB</span>
                <span className="brand-copy">
                  <strong>Centro Belleza</strong>
                  <small>Tu espacio, tu momento</small>
                </span>
              </a>

              <button
                className="menu-toggle"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="main-menu"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>

              <div id="main-menu" className={`nav-menu${menuOpen ? ' is-open' : ''}`}>
                <div className="nav-links">
                  {links.map((link) => (
                    <a key={link.href} href={link.href} onClick={closeMenu}>
                      {link.label}
                    </a>
                  ))}
                </div>
                <a className="booking-link" href="#reservar" onClick={closeMenu}>
                  Reservar cita <span aria-hidden="true">↗</span>
                </a>
              </div>
            </nav>
          </header>

          <main>
            <section className="welcome" id="inicio">
              <p className="eyebrow">Belleza que empieza contigo</p>
              <h1>Un momento para volver a ti.</h1>
              <p className="welcome-text">
                Descubre profesionales y tratamientos pensados para hacerte sentir bien.
              </p>
              <a className="primary-action" href="#servicios">Explorar servicios <span aria-hidden="true">↓</span></a>
            </section>

            <section className="content-section" id="servicios">
              <p className="eyebrow">Nuestros servicios</p>
              <h2>Cuida tu ritmo, cuida de ti.</h2>
            </section>
            <section className="content-section" id="profesionales">
              <p className="eyebrow">Tu equipo de confianza</p>
              <h2>Profesionales que te escuchan.</h2>
            </section>
            <section className="content-section" id="contacto">
              <p className="eyebrow">Estamos cerca</p>
              <h2>Hablemos de tu próxima cita.</h2>
            </section>
            <section className="content-section booking-section" id="reservar">
              <p className="eyebrow">Agenda abierta</p>
              <h2>Tu siguiente momento empieza aquí.</h2>
            </section>
          </main>
    </div>
  )
}

export default App
