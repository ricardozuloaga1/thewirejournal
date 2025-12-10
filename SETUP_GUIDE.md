# 🚀 Local Setup Guide - The Wire Journal

Complete guide to run The Wire Journal locally.

## Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- Supabase account (free tier is fine)
- API keys: OpenAI, Perplexity (required), Gemini, Finnhub (optional)

---

## 📦 Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for database to initialize

### 1.2 Run SQL Schema

1. Go to your Supabase project → SQL Editor
2. Open `backend/database/schema_update.sql`
3. Copy and paste the entire contents
4. Click "Run" to create all tables

You should now have these tables:
- `users`
- `user_bookmarks`
- `user_reading_history`
- `articles` (may already exist)
- `images` (may already exist)
- `agent_runs` (may already exist)
- `site_settings` (may already exist)

### 1.3 Get Supabase Credentials

From your Supabase project settings:
- Project URL: `https://your-project.supabase.co`
- Anon/Public Key: `eyJhbGciOiJIUzI1...` (long string)

---

## 🐍 Step 2: Backend Setup (Flask)

### 2.1 Navigate to Backend

```bash
cd backend
```

### 2.2 Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

This will install Flask, Supabase, OpenAI, and all other dependencies.

### 2.4 Create Environment File

```bash
cp .env.example .env
```

Now edit `.env` file with your actual credentials:

```bash
nano .env  # or use any text editor
```

**Required variables:**
```env
FLASK_APP=app.py
FLASK_ENV=development

# Generate random strings for these (can use: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Supabase (from Step 1.3)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# OpenAI (REQUIRED for AI agents)
OPENAI_API_KEY=sk-...

# Perplexity (REQUIRED for research)
PERPLEXITY_API_KEY=pplx-...

# Optional APIs
GEMINI_API_KEY=your-gemini-key
FINNHUB_API_KEY=your-finnhub-key

# CORS
FRONTEND_URL=http://localhost:5173
```

### 2.5 Start Backend Server

```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Test it works:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"healthy","message":"The Wire Journal API is running"}
```

**Keep this terminal open!**

---

## ⚛️ Step 3: Frontend Setup (React)

### 3.1 Open New Terminal

Keep backend running, open a NEW terminal window.

### 3.2 Navigate to Frontend

```bash
cd frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install React, Vite, Tailwind, and all dependencies.

### 3.4 Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.5 Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open browser:** http://localhost:5173

---

## 🎯 Step 4: Test the Application

### 4.1 Test User Registration

1. Go to http://localhost:5173/register
2. Create an account:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Test123!" (must have uppercase, lowercase, number)
3. Click "Create account"
4. You should be redirected to dashboard

### 4.2 Test API Directly (Optional)

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

You should get back:
```json
{
  "user": {...},
  "access_token": "eyJ...",
  "message": "Registration successful"
}
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 4.3 Check Database

Go to Supabase → Table Editor → `users`

You should see your new user in the table!

---

## 🤖 Step 5: Run AI Agents (Optional)

To generate articles with AI:

### 5.1 Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Perplexity**: https://www.perplexity.ai/settings/api

### 5.2 Add Keys to Backend .env

```env
OPENAI_API_KEY=sk-proj-...
PERPLEXITY_API_KEY=pplx-...
```

### 5.3 Restart Backend

```bash
# In backend terminal, press Ctrl+C
# Then restart:
python app.py
```

### 5.4 Run Agents via API

```bash
# Get your JWT token from login response
TOKEN="your-jwt-token-here"

# Run single agent
curl -X POST http://localhost:5000/api/agents/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "politics",
    "word_count": 800,
    "writing_style": "standard"
  }'

# Or run all agents at once
curl -X POST http://localhost:5000/api/agents/run-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word_count": 800,
    "writing_style": "standard"
  }'
```

This will:
1. Research trending topics
2. Generate articles with AI
3. Save as drafts in database

Check Supabase → `articles` table to see generated articles!

---

## 🐛 Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError`**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Should see (venv) in prompt

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: `SUPABASE_URL not set`**
```bash
# Make sure .env file exists and has correct values
cat .env  # Should show your environment variables
```

### Frontend won't start

**Error: `Cannot find module`**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: `Failed to fetch`**
```bash
# Make sure backend is running on port 5000
curl http://localhost:5000/api/health

# Check .env has correct API URL
cat .env  # Should show VITE_API_URL=http://localhost:5000/api
```

### Database errors

**Error: `relation "users" does not exist`**
```bash
# You need to run the SQL schema
# Go to Supabase SQL Editor and run: backend/database/schema_update.sql
```

### CORS errors in browser console

**Error: `Access-Control-Allow-Origin`**
```bash
# Check backend .env has:
FRONTEND_URL=http://localhost:5173

# Restart backend after changing .env
```

---

## 📝 Summary - Quick Commands

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Open Browser:**
```
http://localhost:5173
```

---

## ✅ Checklist

Before you start, make sure you have:

- [ ] Supabase account created
- [ ] SQL schema run in Supabase
- [ ] Supabase URL and key copied
- [ ] OpenAI API key (for AI features)
- [ ] Perplexity API key (for research)
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Backend .env file configured
- [ ] Frontend .env file configured

---

## 🎓 Ready for Bootcamp Demo!

Once running locally, you can demo:

1. ✅ **User Registration** (POST /api/auth/register)
2. ✅ **User Login** (POST /api/auth/login)
3. ✅ **User Profile** (GET/PUT /api/users/:id)
4. ✅ **Articles CRUD** (All HTTP methods)
5. ✅ **Bookmarks** (POST/DELETE /api/users/:id/bookmarks/:article_id)
6. ✅ **AI Agents** (POST /api/agents/run-all)
7. ✅ **Personalized Feed** (GET /api/articles/personalized)

All bootcamp requirements met! 🎉

