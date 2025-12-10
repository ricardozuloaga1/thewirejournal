# ⚡ Quick Start - Run Locally in 5 Minutes

## 🎯 What You Need
- Python 3.9+
- Node.js 18+
- Supabase account (free)
- OpenAI & Perplexity API keys

---

## 🚀 Step 1: Database (2 minutes)

1. Go to https://supabase.com → Create new project
2. Copy your project URL and anon key
3. Go to SQL Editor → Copy/paste this file:
   ```
   backend/database/schema_update.sql
   ```
4. Click "Run" ✅

---

## 🐍 Step 2: Backend (1 minute)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your keys:
```env
SECRET_KEY=any-random-string-here
JWT_SECRET_KEY=another-random-string
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=sk-your-key
PERPLEXITY_API_KEY=pplx-your-key
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
python app.py
```

Should see: `Running on http://127.0.0.1:5000` ✅

---

## ⚛️ Step 3: Frontend (1 minute)

**NEW TERMINAL:**

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Should see: `Local: http://localhost:5173/` ✅

---

## ✅ Step 4: Test It!

1. **Open**: http://localhost:5173
2. **Click**: "Sign Up"
3. **Register**:
   - Name: Your Name
   - Email: test@example.com
   - Password: Test123! (needs uppercase, lowercase, number)
4. **You're in!** 🎉

---

## 🤖 Step 5: Generate Articles (Optional)

1. Go to: http://localhost:5173/admin
2. Click "Run All Agents"
3. Wait ~2-3 minutes
4. Go to homepage to see generated articles!

---

## 🐛 Troubleshooting

**Backend won't start?**
```bash
# Make sure venv is activated (should see "(venv)" in terminal)
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Module not found" errors?**
- Check that both terminals are in correct directories
- Backend terminal: `backend/` folder
- Frontend terminal: `frontend/` folder

**CORS errors?**
- Check backend `.env` has `FRONTEND_URL=http://localhost:5173`
- Restart backend after changing `.env`

---

## 📋 Quick Test Commands

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

## ✨ You're Done!

Your app is running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: Supabase

Next: Go to http://localhost:5173 and create an account!

