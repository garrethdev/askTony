ALTER TABLE meal_scans ADD COLUMN IF NOT EXISTS analysis_payload jsonb;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS analysis_payload jsonb;

