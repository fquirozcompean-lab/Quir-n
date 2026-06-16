-- Quirón SaaS — Esquema limpio para el proyecto Supabase multi-tenant
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run

-- ════════════════════════════════════════════════════════════════
--  doctor_profiles — identidad, branding, catálogos y billing
--  por médico (1:1 con auth.users)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE doctor_profiles (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Identidad
  nombre            text NOT NULL DEFAULT '',
  nombre_corto      text NOT NULL DEFAULT '',
  apellido1         text NOT NULL DEFAULT '',
  apellido2         text NOT NULL DEFAULT '',
  nombres           text NOT NULL DEFAULT '',
  especialidades    text NOT NULL DEFAULT '',
  especialidad      text NOT NULL DEFAULT '',
  cedula_prof       text NOT NULL DEFAULT '',
  cedula_esp        text,
  cedula_esp2       text,
  email             text,
  email_seguros     text,
  celular           text,
  rfc               text,
  emergencias       text,
  ciudad            text,
  -- Branding interno (logo/firma en recetas y formatos — no el ícono de la PWA)
  login_subtitulo   text,
  review_url        text,
  logo_url          text,
  firma_url         text,
  -- Procedimiento especial configurable (ej. Colonoscopía, Cistoscopía)
  procedimiento     jsonb NOT NULL DEFAULT '{"label":"Colonoscopía","href":"/colonoscopia","mostrar":false}',
  -- Consultorios: { [clave]: {hospital, consultorio, telefono, ciudad, estado} }
  consultorios      jsonb NOT NULL DEFAULT '{}',
  -- Catálogos editables por el médico
  cat_dx            jsonb NOT NULL DEFAULT '[]',
  cat_tx            jsonb NOT NULL DEFAULT '[]',
  cat_est           jsonb NOT NULL DEFAULT '[]',
  cat_posologia     jsonb NOT NULL DEFAULT '{}',
  -- Onboarding
  onboarding_done   boolean NOT NULL DEFAULT false,
  -- Billing (Stripe)
  stripe_customer_id     text UNIQUE,
  stripe_subscription_id text UNIQUE,
  subscription_status    text NOT NULL DEFAULT 'none',  -- none|trialing|active|past_due|canceled|incomplete
  trial_ends_at           timestamptz,
  current_period_end      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_profiles_own" ON doctor_profiles
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════════
--  patients
-- ════════════════════════════════════════════════════════════════
CREATE TABLE patients (
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
  ahf_abuelo_materno  text,
  ahf_abuela_materna  text,
  ahf_abuelo_paterno  text,
  ahf_abuela_paterna  text,
  ahf_padre           text,
  ahf_madre           text,
  ahf_hermanos        text,
  ahf_hijos           text,
  ahf_otros           text,
  otros_np            text,
  cronicos            text,
  quirurgicos         text,
  alergicos           text,
  medicamentos        text,
  transfusiones       text,
  tabaquismo          text,
  alcohol             text,
  drogas              text,
  gesta               text,
  menarca             text,
  ritmo               text,
  fur                 text,
  anticonceptivos     text,
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

-- ════════════════════════════════════════════════════════════════
--  consultations — consultas de seguimiento
-- ════════════════════════════════════════════════════════════════
CREATE TABLE consultations (
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

-- ════════════════════════════════════════════════════════════════
--  evolution_notes
-- ════════════════════════════════════════════════════════════════
CREATE TABLE evolution_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota        text NOT NULL,
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
--  attachments
-- ════════════════════════════════════════════════════════════════
CREATE TABLE attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_archivo  text NOT NULL,
  tipo            text NOT NULL DEFAULT 'PDF',
  storage_path    text NOT NULL,
  fecha           date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
--  prescriptions — recetas digitales compartibles vía link público
-- ════════════════════════════════════════════════════════════════
CREATE TABLE prescriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token           text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha           date,
  paciente_nombre text NOT NULL,
  consultorio     text,
  dx              text[] DEFAULT '{}',
  dx_texto        text,
  tx              text[] DEFAULT '{}',
  tx_texto        text,
  estudios        text[] DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '60 days')
);

-- ════════════════════════════════════════════════════════════════
--  RLS — cada médico solo ve sus propios datos
-- ════════════════════════════════════════════════════════════════
ALTER TABLE patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_own" ON patients
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consultations_own" ON consultations
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_own" ON evolution_notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attachments_own" ON attachments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- prescriptions: el médico ve/crea las suyas; el acceso público vía token
-- pasa por get_prescription_by_token (no por RLS directo)
CREATE POLICY "prescriptions_own" ON prescriptions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════
--  Acceso público controlado para /receta/[token]
--  (la ruta no tiene sesión de usuario — no puede pasar por las
--   políticas RLS de arriba, que exigen auth.uid() = user_id)
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_prescription_by_token(p_token text)
RETURNS TABLE (
  fecha date, paciente_nombre text, consultorio text,
  dx text[], dx_texto text, tx text[], tx_texto text, estudios text[],
  doc_nombre text, doc_cedula_prof text, doc_cedula_esp text,
  doc_emergencias text, doc_email text, doc_logo_url text, doc_firma_url text,
  doc_consultorios jsonb
)
SECURITY DEFINER SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    rx.fecha, rx.paciente_nombre, rx.consultorio,
    rx.dx, rx.dx_texto, rx.tx, rx.tx_texto, rx.estudios,
    dp.nombre, dp.cedula_prof, dp.cedula_esp,
    dp.emergencias, dp.email, dp.logo_url, dp.firma_url,
    dp.consultorios
  FROM prescriptions rx
  JOIN doctor_profiles dp ON dp.user_id = rx.user_id
  WHERE rx.token = p_token AND rx.expires_at > now();
$$;

-- ════════════════════════════════════════════════════════════════
--  Storage — bucket "estudios" para archivos adjuntos (privado)
-- ════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('estudios', 'estudios', false);

CREATE POLICY "estudios_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "estudios_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "estudios_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ════════════════════════════════════════════════════════════════
--  Storage — bucket "branding" para logo/firma (público de solo
--  lectura: se referencian con <img src> en recetas/formatos que
--  se ven sin sesión iniciada)
-- ════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true);

CREATE POLICY "branding_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');
CREATE POLICY "branding_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "branding_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "branding_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);
