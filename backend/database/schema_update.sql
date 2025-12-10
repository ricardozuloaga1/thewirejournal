-- ============================================
-- User Authentication Tables for The Wire Journal
-- Add these to your existing Supabase schema
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"sections": ["politics", "economics", "world", "business", "tech", "opinion"]}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- USER BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON user_bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON user_bookmarks(created_at DESC);

-- ============================================
-- USER READING HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_progress INTEGER DEFAULT 100 CHECK (read_progress >= 0 AND read_progress <= 100)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON user_reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON user_reading_history(read_at DESC);

-- ============================================
-- TRIGGER: Update users updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) for Users
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_history ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Anon can insert users" ON users;
CREATE POLICY "Anon can insert users"
  ON users FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can read users" ON users;
CREATE POLICY "Anon can read users"
  ON users FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon can update users" ON users;
CREATE POLICY "Anon can update users"
  ON users FOR UPDATE TO anon
  USING (true);

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can manage own bookmarks"
  ON user_bookmarks FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Anon can manage bookmarks" ON user_bookmarks;
CREATE POLICY "Anon can manage bookmarks"
  ON user_bookmarks FOR ALL TO anon
  USING (true);

-- Reading history policies
DROP POLICY IF EXISTS "Users can manage own history" ON user_reading_history;
CREATE POLICY "Users can manage own history"
  ON user_reading_history FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Anon can manage history" ON user_reading_history;
CREATE POLICY "Anon can manage history"
  ON user_reading_history FOR ALL TO anon
  USING (true);

-- ============================================
-- DONE! Now you have user authentication tables
-- ============================================

