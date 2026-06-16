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
