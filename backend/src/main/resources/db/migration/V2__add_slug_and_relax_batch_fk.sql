-- =============================================
-- V2: Schema evolution for Phase 1-3 modules
-- =============================================
-- Add slug column to source_systems for API filtering
ALTER TABLE source_systems ADD COLUMN slug VARCHAR(100);
UPDATE source_systems SET slug = LOWER(REPLACE(code, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE source_systems ALTER COLUMN slug SET NOT NULL;
ALTER TABLE source_systems ADD CONSTRAINT uq_source_systems_slug UNIQUE (slug);
CREATE INDEX idx_source_systems_slug ON source_systems(slug);
-- Make ingestion_batch_id nullable for direct transaction ingest
-- (full ingestion module with batch tracking will be implemented later)
ALTER TABLE transactions ALTER COLUMN ingestion_batch_id DROP NOT NULL;