-- Migración: agrega "Análisis", "Hora de consulta" y normaliza recetas
-- Ejecutar en: Supabase → SQL Editor → New query → Run

ALTER TABLE patients      ADD COLUMN IF NOT EXISTS analisis      text;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS analisis      text;

ALTER TABLE patients      ADD COLUMN IF NOT EXISTS hora_consulta text;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS hora          text;
