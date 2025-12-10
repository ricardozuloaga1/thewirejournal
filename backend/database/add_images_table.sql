-- ============================================
-- ADD IMAGES TABLE (if not exists)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('extracted', 'licensed', 'ai_generated')),
  url TEXT NOT NULL,
  origin_url TEXT,
  prompt TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_article_id ON images(article_id);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Public can read images" ON images;
DROP POLICY IF EXISTS "Anon can manage images" ON images;

CREATE POLICY "Public can read images"
  ON images FOR SELECT
  USING (true);

CREATE POLICY "Anon can manage images"
  ON images FOR ALL TO anon
  USING (true) WITH CHECK (true);

