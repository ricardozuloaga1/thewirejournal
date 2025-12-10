-- ============================================
-- ADD CAPTION COLUMN TO IMAGES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add caption column for news-style image descriptions
-- This is separate from alt_text (accessibility) - caption is the visible description
ALTER TABLE images ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add a comment to explain the difference
COMMENT ON COLUMN images.caption IS 'Visible caption displayed below image in italic, e.g., "President Biden speaks at press conference on Tuesday"';
COMMENT ON COLUMN images.alt_text IS 'Accessibility text for screen readers, not displayed visually';




