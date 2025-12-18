-- Align schema to v1 contract
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS reflections CASCADE;
DROP TABLE IF EXISTS weight_entries CASCADE;
DROP TABLE IF EXISTS weight_goals CASCADE;
DROP TABLE IF EXISTS body_checkins CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS meal_scans CASCADE;
DROP TABLE IF EXISTS tag_definitions CASCADE;
DROP TABLE IF EXISTS cohort_memberships CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_profile CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  auth_provider text NOT NULL CHECK (auth_provider IN ('email','apple','google')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_profile (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  username text NOT NULL UNIQUE,
  avatar_id text NOT NULL,
  timezone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reminders_enabled_meals boolean NOT NULL DEFAULT false,
  reminders_enabled_body_checkin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_onboarding (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  main_reason_key text NOT NULL,
  main_challenges_keys text[] NOT NULL,
  eating_pattern_key text NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_key text NOT NULL,
  week_start date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_key, week_start)
);

CREATE TABLE cohort_memberships (
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  PRIMARY KEY (cohort_id, user_id)
);

CREATE TABLE tag_definitions (
  tag_key text PRIMARY KEY,
  display_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('balance','energy','digestion','general')),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE meal_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('uploaded','analyzing','ready','failed')),
  image_storage_key text NOT NULL,
  metabolic_score numeric(3,1) CHECK (metabolic_score >= 0 AND metabolic_score <= 10),
  tag_keys text[],
  explanation_short text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  meal_scan_id uuid REFERENCES meal_scans(id) ON DELETE SET NULL,
  meal_name text NOT NULL,
  meal_description text,
  meal_type text CHECK (meal_type IN ('breakfast','lunch','dinner','snack','other')),
  eaten_at timestamptz NOT NULL DEFAULT now(),
  energy_level text CHECK (energy_level IN ('low','ok','high')),
  metabolic_score numeric(3,1) NOT NULL CHECK (metabolic_score >= 0 AND metabolic_score <= 10),
  tag_keys text[] NOT NULL,
  explanation_short text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE body_checkins (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  energy_level text NOT NULL CHECK (energy_level IN ('low','ok','high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date)
);

CREATE TABLE weight_goals (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  goal_weight_kg numeric(6,2) NOT NULL CHECK (goal_weight_kg > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE weight_entries (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_at date NOT NULL,
  weight_kg numeric(6,2) NOT NULL CHECK (weight_kg > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, measured_at)
);

CREATE TABLE reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('meal','reflection')),
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actor_user_id, target_type, target_id)
);

CREATE INDEX idx_meals_user_eaten ON meals(user_id, eaten_at DESC);
CREATE INDEX idx_meals_cohort_eaten ON meals(cohort_id, eaten_at DESC);
CREATE INDEX idx_meal_scans_user_created ON meal_scans(user_id, created_at DESC);
CREATE INDEX idx_reflections_cohort_created ON reflections(cohort_id, created_at DESC);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);

