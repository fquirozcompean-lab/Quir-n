export const DOCTOR = {
  // ── Identidad del médico ───────────────────────────────────────────────────
  nombre:         'Dr. Fernando Quiroz Compeán',
  nombreCorto:    'Dr. Quiroz',           // aparece en el header de la app
  apellido1:      'QUIROZ',
  apellido2:      'COMPEAN',
  nombres:        'FERNANDO',
  especialidades: 'Medicina Interna · Gastroenterología · Endoscopía Gastrointestinal',
  especialidad:   'GASTROENTEROLOGÍA',
  cedula_prof:    '10566242',
  cedula_esp:     '13511062',
  cedula_esp2:    '12072462',
  email:          'drquirozgastroenterologia@gmail.com',
  email_seguros:  'quiroz_fernando_@hotmail.com',
  celular:        '5525595880',
  rfc:            'QUCF910806MC9',
  emergencias:    '477 523 2323',
  ciudad:         'León, Guanajuato',

  // ── Branding de la aplicación ─────────────────────────────────────────────
  appName:        'Quirón',               // nombre de la app (header, login, PWA)
  loginSubtitulo: 'Dr. Fernando Quiroz · Gastroenterología',

  // ── Reseña de Google (botón WhatsApp en el expediente del paciente) ────────
  reviewUrl:      'https://g.page/r/CUczEWK5B3LOEBM/review',

  // ── Procedimiento especial de la especialidad ─────────────────────────────
  // Cambia esto para otra especialidad (ej. Cistoscopía → /cistoscopia)
  // mostrar: false para desactivar el botón y la sección completa
  procedimiento: {
    label:   'Colonoscopía',
    href:    '/colonoscopia',
    mostrar: true,
  },

  // ── Consultorios ──────────────────────────────────────────────────────────
  consultorios: {
    Muguerza: {
      hospital:    'Christus Muguerza Altagracia',
      consultorio: 'Consultorio 312',
      telefono:    '4778063946',
      ciudad:      'León',
      estado:      'Guanajuato',
    },
    Angeles: {
      hospital:    'Hospital Ángeles León',
      consultorio: 'Torre II, Consultorio 615',
      telefono:    '4791037564',
      ciudad:      'León',
      estado:      'Guanajuato',
    },
  },
} as const
