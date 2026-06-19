export interface Patient {
  id: string
  user_id: string
  nombre: string
  fecha_nacimiento: string | null
  sexo: 'F' | 'M' | null
  lugar_nacimiento: string | null
  ciudad: string | null
  escolaridad: string | null
  ocupacion: string | null
  estado_civil: string | null
  religion: string | null
  hemotipo: string | null
  telefono: string | null
  fecha_consulta: string | null
  hora_consulta: string | null
  consultorio: string | null
  fuente: string | null
  refiere: string | null
  ahf_abuelo_materno: string | null
  ahf_abuela_materna: string | null
  ahf_abuelo_paterno: string | null
  ahf_abuela_paterna: string | null
  ahf_padre: string | null
  ahf_madre: string | null
  ahf_hermanos: string | null
  ahf_hijos: string | null
  ahf_otros: string | null
  otros_np: string | null
  cronicos: string | null
  quirurgicos: string | null
  alergicos: string | null
  medicamentos: string | null
  transfusiones: string | null
  tabaquismo: string | null
  alcohol: string | null
  drogas: string | null
  gesta: string | null
  menarca: string | null
  ritmo: string | null
  fur: string | null
  anticonceptivos: string | null
  padecimiento: string | null
  exploracion: string | null
  analisis: string | null
  dx: string[]
  dx_texto: string | null
  tx: string[]
  tx_texto: string | null
  estudios_solicitados: string[]
  signos_vitales: { ta?: string; fc?: string; fr?: string; temp?: string; spo2?: string } | null
  pronostico: string | null
  expediente_num?: number | null
  created_at: string
  updated_at: string
}

export interface EvolutionNote {
  id: string
  patient_id: string
  user_id: string
  fecha: string
  nota: string
  created_at: string
}

export interface Attachment {
  id: string
  patient_id: string
  user_id: string
  nombre_archivo: string
  tipo: string
  storage_path: string
  fecha: string
  created_at: string
}

export type PatientWithRelations = Patient & {
  evolution_notes?: EvolutionNote[]
  attachments?: Attachment[]
}

export interface Consultorio {
  hospital: string
  consultorio: string
  telefono: string
  ciudad: string
  estado: string
}

export interface ProcedimientoSeccion {
  titulo: string
  contenido: string
}

export interface Procedimiento {
  label: string
  href: string
  mostrar: boolean
  // Pre-procedure configurable sections
  pre_secciones?: ProcedimientoSeccion[]
  pre_prep_inicio?: number   // hours offset for {hora_prep_inicio} (default -6)
  pre_prep_fin?: number      // hours offset for {hora_prep_fin} (default -4)
  // Post-surgical
  postquirurgico_mostrar?: boolean
  postquirurgico_label?: string
  postquirurgico_secciones?: ProcedimientoSeccion[]
  // Post-care
  postcuidados_mostrar?: boolean
  postcuidados_label?: string
  postcuidados_secciones?: ProcedimientoSeccion[]
}

export interface DoctorProfile {
  user_id: string
  nombre: string
  nombre_corto: string
  apellido1: string
  apellido2: string
  nombres: string
  especialidades: string
  especialidad: string
  cedula_prof: string
  cedula_esp: string | null
  cedula_esp2: string | null
  email: string | null
  email_seguros: string | null
  celular: string | null
  rfc: string | null
  emergencias: string | null
  ciudad: string | null
  login_subtitulo: string | null
  review_url: string | null
  logo_url: string | null
  firma_url: string | null
  procedimiento: Procedimiento
  consultorios: Record<string, Consultorio>
  cat_dx: string[]
  cat_tx: string[]
  cat_est: string[]
  cat_posologia: Record<string, string>
  onboarding_done: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  trial_ends_at: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}
