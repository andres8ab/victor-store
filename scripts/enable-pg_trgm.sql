-- Run this once in your Neon (or Postgres) SQL editor to enable fuzzy search.
-- Enables misspellings like "hiunday" → "hyundai".
CREATE EXTENSION IF NOT EXISTS pg_trgm;
