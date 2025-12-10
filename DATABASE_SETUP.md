# 🗄️ Database Setup - Quick Guide

## ✅ Good News!

You already have your main database schema set up! You just need to add the **user authentication tables**.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/uhprgdoidwantxbhtbss
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run User Tables Migration

1. Open this file: `backend/database/add_user_tables.sql`
2. **Copy the ENTIRE contents**
3. **Paste into SQL Editor**
4. Click **Run** (or press Cmd+Enter)

That's it! ✅

---

## 📋 What This Adds

This migration adds **only** the missing tables:

1. ✅ `users` - User accounts
2. ✅ `user_bookmarks` - Saved articles
3. ✅ `user_reading_history` - Reading tracking
4. ✅ `site_settings` - Site configuration (if not exists)

**Your existing tables are untouched:**
- ✅ `articles` - Already exists
- ✅ `images` - Already exists
- ✅ `agent_runs` - Already exists

---

## ✅ Verify It Worked

After running the SQL, check your Supabase dashboard:

1. Go to **Table Editor**
2. You should see these new tables:
   - `users`
   - `user_bookmarks`
   - `user_reading_history`
   - `site_settings` (if it didn't exist)

---

## 🐛 Troubleshooting

### Error: "relation 'users' already exists"

**This means you already ran it!** You're good to go. The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### Error: "function update_updated_at_column does not exist"

This function should already exist from your original schema. If you get this error, add this first:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

Then run the migration again.

### Error: "permission denied"

Make sure you're running this in the **SQL Editor** (not the Table Editor). The SQL Editor has full permissions.

---

## ✨ Next Steps

Once the migration is complete:

1. ✅ **Start backend**: `cd backend && python app.py`
2. ✅ **Start frontend**: `cd frontend && npm run dev`
3. ✅ **Test registration**: Go to http://localhost:5173/register

---

## 📊 Your Database Structure

After migration, you'll have:

**Existing Tables (from your original schema):**
- `articles` - News articles
- `images` - Article images
- `agent_runs` - AI agent execution logs

**New Tables (from migration):**
- `users` - User accounts
- `user_bookmarks` - Saved articles
- `user_reading_history` - Reading tracking
- `site_settings` - Site configuration

**Total: 7 tables** ✅

---

## 🎯 Ready to Go!

Once you've run the migration, your database is fully set up for:
- ✅ User authentication
- ✅ Article management
- ✅ Bookmarks
- ✅ Reading history
- ✅ AI agent runs

**You're all set!** 🚀

