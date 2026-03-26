-- =============================================
-- V3: Extend validation_results for validation engine
-- =============================================

-- Add updated_at for BaseEntity compatibility
ALTER TABLE validation_results ADD COLUMN updated_at TIMESTAMPTZ;
UPDATE validation_results SET updated_at = created_at WHERE updated_at IS NULL;

-- Add field_name to capture which field triggered the rule
ALTER TABLE validation_results ADD COLUMN field_name VARCHAR(255);

