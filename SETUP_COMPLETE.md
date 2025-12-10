# ✅ Setup Complete! Your API Keys Are Configured

## 🎉 What I Just Did

1. ✅ Created `backend/.env` with all your API keys
2. ✅ Configured Supabase connection
3. ✅ Added OpenAI API key
4. ✅ Added Perplexity API key
5. ✅ Set up CORS for frontend

---

## 🚀 Next Steps - Run Your App!

### Step 1: Run Database Schema (IMPORTANT!)

Go to your Supabase dashboard:
1. Open: https://supabase.com/dashboard/project/uhprgdoidwantxbhtbss
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the ENTIRE contents of: `backend/database/schema_update.sql`
5. Paste into SQL Editor
6. Click **Run** (or press Cmd+Enter)

This creates the `users`, `user_bookmarks`, and `user_reading_history` tables.

---

### Step 2: Start Backend

**Terminal 1:**
```bash
cd backend

# Create virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start server
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

---

### Step 3: Start Frontend

**Terminal 2 (NEW TERMINAL):**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 4: Open Your App!

**Open browser:** http://localhost:5173

---

## ✅ Test It Works

1. **Click "Sign Up"** (or go to http://localhost:5173/register)
2. **Create account:**
   - Name: Your Name
   - Email: test@example.com
   - Password: Test123! (needs uppercase, lowercase, number)
3. **You should be logged in!** ✅

---

## 🤖 Generate Your First AI Articles

1. **Go to:** http://localhost:5173/admin
2. **Click:** "Run All Agents"
3. **Wait:** 2-3 minutes (agents are researching & writing)
4. **Check:** Go back to homepage to see articles!

---

## 🐛 Troubleshooting

### Backend won't start?

**Error: "ModuleNotFoundError"**
```bash
# Make sure venv is activated (should see "(venv)" in prompt)
source venv/bin/activate
pip install -r requirements.txt
```

**Error: "SUPABASE_URL not set"**
```bash
# Check .env file exists
cat backend/.env
# Should show your Supabase URL
```

### Frontend won't start?

**Error: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database errors?

**Error: "relation 'users' does not exist"**
- You need to run the SQL schema in Supabase SQL Editor
- See Step 1 above

### CORS errors?

**Error in browser console: "Access-Control-Allow-Origin"**
- Make sure backend is running on port 5000
- Check `backend/.env` has: `FRONTEND_URL=http://localhost:5173`
- Restart backend after changing .env

---

## 📊 Your API Keys Status

| Service | Status | Key Added |
|---------|--------|-----------|
| Supabase | ✅ Ready | Yes |
| OpenAI | ✅ Ready | Yes |
| Perplexity | ✅ Ready | Yes |
| Gemini | ⚪ Optional | No (not needed) |
| Finnhub | ⚪ Optional | No (using mock data) |

---

## 🎯 Quick Test Commands

**Test backend health:**
```bash
curl http://localhost:5000/api/health
```

**Test user registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## 📝 What's Next?

1. ✅ **Run database schema** (Step 1 above)
2. ✅ **Start backend** (Step 2)
3. ✅ **Start frontend** (Step 3)
4. ✅ **Create account** (Step 4)
5. ✅ **Generate articles** (Admin panel)
6. ✅ **Demo for bootcamp!** 🎉

---

## 🔐 Security Note

Your `.env` file contains sensitive keys. It's already in `.gitignore` so it won't be committed to git.

**Never share these keys publicly!**

---

## ✨ You're All Set!

Your app is fully configured and ready to run. Just follow the steps above and you'll have your AI-powered newsroom running locally!

**Questions?** Check the troubleshooting section or the other documentation files.

