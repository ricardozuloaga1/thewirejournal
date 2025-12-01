-- ============================================
-- The Wire Journal Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- IMAGES TABLE (created first - no FK dependencies)
-- ============================================
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID, -- FK added later
  image_type TEXT NOT NULL CHECK (image_type IN ('extracted', 'licensed', 'ai_generated')),
  url TEXT NOT NULL,
  origin_url TEXT,
  prompt TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_article_id ON images(article_id);

-- ============================================
-- ARTICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('politics', 'economics', 'opinion', 'world', 'business', 'tech')),
  image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'discarded')),
  slug TEXT UNIQUE NOT NULL,
  author TEXT NOT NULL DEFAULT 'The Wire',
  read_time TEXT NOT NULL DEFAULT '3 min read',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now add the FK from images to articles
ALTER TABLE images 
  ADD CONSTRAINT fk_images_article 
  FOREIGN KEY (article_id) 
  REFERENCES articles(id) 
  ON DELETE CASCADE;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles(section);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status_section ON articles(status, section);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- ============================================
-- AGENT RUNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  run_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  articles_created INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('success', 'error', 'running')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_run_time ON agent_runs(run_time DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Anon can read all articles" ON articles;
DROP POLICY IF EXISTS "Anon can insert articles" ON articles;
DROP POLICY IF EXISTS "Anon can update articles" ON articles;
DROP POLICY IF EXISTS "Anon can delete articles" ON articles;

DROP POLICY IF EXISTS "Public can read images" ON images;
DROP POLICY IF EXISTS "Anon can manage images" ON images;

DROP POLICY IF EXISTS "Anon can manage agent_runs" ON agent_runs;

-- ARTICLES POLICIES
-- Public can read published articles
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Anon role (used by our app) can do everything
CREATE POLICY "Anon can read all articles"
  ON articles FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert articles"
  ON articles FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update articles"
  ON articles FOR UPDATE TO anon
  USING (true);

CREATE POLICY "Anon can delete articles"
  ON articles FOR DELETE TO anon
  USING (true);

-- IMAGES POLICIES
CREATE POLICY "Public can read images"
  ON images FOR SELECT
  USING (true);

CREATE POLICY "Anon can manage images"
  ON images FOR ALL TO anon
  USING (true);

-- AGENT RUNS POLICIES
CREATE POLICY "Anon can manage agent_runs"
  ON agent_runs FOR ALL TO anon
  USING (true);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anon can manage site_settings" ON site_settings;
CREATE POLICY "Anon can manage site_settings"
  ON site_settings FOR ALL TO anon
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read site_settings" ON site_settings;
CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- ============================================
-- DONE!
-- ============================================
