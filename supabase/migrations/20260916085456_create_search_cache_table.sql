/*
# Create search_cache table for caching grocery search results

1. New Tables
- `search_cache`
  - `id` (uuid, primary key)
  - `query` (text, the search term, e.g. "Maggi")
  - `platform` (text, "blinkit" or "instamart")
  - `location` (text, the delivery location label, e.g. "Connaught Place, Delhi")
  - `results` (jsonb, array of product listings from the platform)
  - `created_at` (timestamptz, defaults to now())
  - Composite index on (query, platform, location) for fast lookups
2. Security
- Enable RLS on `search_cache`.
- Allow anon + authenticated CRUD because this is a no-auth app and cache data is intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  platform text NOT NULL,
  location text NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_cache_qpl ON search_cache (query, platform, location);

ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cache" ON search_cache;
CREATE POLICY "anon_select_cache" ON search_cache FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cache" ON search_cache;
CREATE POLICY "anon_insert_cache" ON search_cache FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cache" ON search_cache;
CREATE POLICY "anon_update_cache" ON search_cache FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cache" ON search_cache;
CREATE POLICY "anon_delete_cache" ON search_cache FOR DELETE
  TO anon, authenticated USING (true);
