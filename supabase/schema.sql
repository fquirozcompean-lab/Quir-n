-- ExpedienteGastro — Schema v1
-- Ejecutar en el SQL Editor de Supabase

-- ─── Tabla: patients ────────────────────────────────────────────────────────
CREATE TABLE patients (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Datos generales
  nombre             TEXT NOT NULL,
  fecha_nacimiento   DATE,
  sexo               CHAR(1) CHECK (sexo IN ('F', 'M')),
  telefono           TEXT,
  ciudad             TEXT,
  ocupacion          TEXT,
  fuente             TEXT,
  refiere            TEXT,
  -- Antecedentes heredofamiliares
  ahf                TEXT,
  -- Personales no patológicos
  tabaquismo         TEXT DEFAULT 'Negativo',
  alcohol            TEXT DEFAULT 'Negativo',
  otros_np           TEXT,
  -- Personales patológicos
  cronicos           TEXT,
  quirurgicos        TEXT,
  alergicos          TEXT,
  medicamentos       TEXT,
  transfusiones      TEXT,
  drogas             TEXT,
  -- Ginecológicos (solo si sexo = F)
  gesta              TEXT,
  menarca            TEXT,
  ritmo              TEXT,
  fur                DATE,
  anticonceptivos    TEXT,
  -- Consulta
  padecimiento       TEXT,
  exploracion        TEXT,
  dx                 TEXT[] DEFAULT '{}',
  dx_texto           TEXT,
  tx                 TEXT[] DEFAULT '{}',
  tx_texto           TEXT,
  estudios_solicitados TEXT[] DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabla: evolution_notes ─────────────────────────────────────────────────
CREATE TABLE evolution_notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id  UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  nota        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabla: attachments ─────────────────────────────────────────────────────
CREATE TABLE attachments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_archivo  TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('PDF', 'IMG')),
  storage_path    TEXT NOT NULL,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE patients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments    ENABLE ROW LEVEL SECURITY;

-- patients
CREATE POLICY "patients_select" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patients_insert" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "patients_update" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "patients_delete" ON patients FOR DELETE USING (auth.uid() = user_id);

-- evolution_notes
CREATE POLICY "notes_select" ON evolution_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON evolution_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON evolution_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON evolution_notes FOR DELETE USING (auth.uid() = user_id);

-- attachments
CREATE POLICY "attach_select" ON attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attach_insert" ON attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attach_delete" ON attachments FOR DELETE USING (auth.uid() = user_id);

-- ─── Trigger: updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Crear manualmente en Supabase > Storage:
--   Nombre: estudios
--   Privado: SÍ (no public)
-- Políticas del bucket (Storage policies):
INSERT INTO storage.buckets (id, name, public) VALUES ('estudios', 'estudios', false);

CREATE POLICY "estudios_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "estudios_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "estudios_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'estudios' AND auth.uid()::text = (storage.foldername(name))[1]);
