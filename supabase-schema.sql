-- ═══════════════════════════════════════════════════════════════
--  Esquema completo para Expediente Clínico (Quirón / variantes)
--  Pegar en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Tabla principal de pacientes ──────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expediente_num      serial,
  nombre              text NOT NULL,
  fecha_nacimiento    date,
  sexo                text,
  lugar_nacimiento    text,
  ciudad              text,
  escolaridad         text,
  ocupacion           text,
  estado_civil        text,
  religion            text,
  hemotipo            text,
  telefono            text,
  fecha_consulta      date,
  consultorio         text,
  fuente              text,
  refiere             text,
  -- Antecedentes heredofamiliares
  ahf_abuelo_materno  text,
  ahf_abuela_materna  text,
  ahf_abuelo_paterno  text,
  ahf_abuela_paterna  text,
  ahf_padre           text,
  ahf_madre           text,
  ahf_hermanos        text,
  ahf_hijos           text,
  ahf_otros           text,
  -- Antecedentes personales
  otros_np            text,
  cronicos            text,
  quirurgicos         text,
  alergicos           text,
  medicamentos        text,
  transfusiones       text,
  tabaquismo          text,
  alcohol             text,
  drogas              text,
  -- Ginecológicos
  gesta               text,
  menarca             text,
  ritmo               text,
  fur                 text,
  anticonceptivos     text,
  -- Historia clínica inicial
  padecimiento        text,
  exploracion         text,
  dx                  text[]  DEFAULT '{}',
  dx_texto            text,
  tx                  text[]  DEFAULT '{}',
  tx_texto            text,
  estudios_solicitados text[] DEFAULT '{}',
  signos_vitales      jsonb,
  pronostico          text,
  created_at          timestamptz DEFAULT now()
);

-- ── Consultas de seguimiento ──────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha               date NOT NULL DEFAULT CURRENT_DATE,
  consultorio         text,
  motivo              text,
  padecimiento        text,
  exploracion         text,
  dx                  text[]  DEFAULT '{}',
  dx_texto            text,
  tx                  text[]  DEFAULT '{}',
  tx_texto            text,
  estudios_solicitados text[] DEFAULT '{}',
  signos_vitales      jsonb,
  pronostico          text,
  created_at          timestamptz DEFAULT now()
);

-- ── Notas de evolución ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evolution_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota        text NOT NULL,
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);

-- ── Archivos adjuntos (estudios, laboratorios, etc.) ──────────
CREATE TABLE IF NOT EXISTS attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_archivo  text NOT NULL,
  tipo            text NOT NULL DEFAULT 'PDF',
  storage_path    text NOT NULL,
  fecha           date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
--  Row Level Security — cada médico solo ve sus propios datos
-- ══════════════════════════════════════════════════════════════

ALTER TABLE patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments   ENABLE ROW LEVEL SECURITY;

-- patients
CREATE POLICY "patients_own" ON patients
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- consultations
CREATE POLICY "consultations_own" ON consultations
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- evolution_notes
CREATE POLICY "notes_own" ON evolution_notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- attachments
CREATE POLICY "attachments_own" ON attachments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
--  Storage — bucket "estudios" para archivos adjuntos
--  (crear el bucket manualmente en Storage → New bucket → nombre: estudios → Private)
--  Luego ejecutar estas políticas:
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "storage_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_own_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_own_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]
  );
