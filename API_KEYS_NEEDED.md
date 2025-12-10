# 🔑 API Keys Required

## ✅ **REQUIRED** (App won't work without these)

### 1. **Supabase** (Database)
- **Why**: Stores all your data (users, articles, bookmarks)
- **Get it**: https://supabase.com → Create project → Settings → API
- **What you need**:
  - `SUPABASE_URL` - Your project URL (e.g., `https://xxxxx.supabase.co`)
  - `SUPABASE_KEY` - Anon/Public key (starts with `eyJ...`)
- **Cost**: FREE tier is enough
- **Where to add**: `backend/.env`

---

### 2. **OpenAI** (AI Article Generation)
- **Why**: Powers all AI agents to write articles
- **Get it**: https://platform.openai.com/api-keys → Create new key
- **What you need**:
  - `OPENAI_API_KEY` - Starts with `sk-proj-...` or `sk-...`
- **Cost**: ~$0.01-0.10 per article (pay-as-you-go)
- **Where to add**: `backend/.env`
- **Note**: Without this, agents won't generate articles

---

### 3. **Perplexity** (Research)
- **Why**: Agents use this to research current news topics
- **Get it**: https://www.perplexity.ai/settings/api → Generate API key
- **What you need**:
  - `PERPLEXITY_API_KEY` - Starts with `pplx-...`
- **Cost**: FREE tier: 5 requests/day, then paid
- **Where to add**: `backend/.env`
- **Note**: Without this, agents can't research topics

---

## ⚠️ **OPTIONAL** (App works without, but features limited)

### 4. **Gemini** (Image Generation - Alternative)
- **Why**: Alternative to DALL-E for generating article images
- **Get it**: https://aistudio.google.com/app/apikey
- **What you need**:
  - `GEMINI_API_KEY`
- **Cost**: FREE tier available
- **Where to add**: `backend/.env`
- **Note**: If not provided, app uses DALL-E instead

---

### 5. **Finnhub** (Live Market Data)
- **Why**: Real-time stock market ticker (currently using mock data)
- **Get it**: https://finnhub.io/register → Free API key
- **What you need**:
  - `FINNHUB_API_KEY`
- **Cost**: FREE tier: 60 calls/minute
- **Where to add**: `backend/.env`
- **Note**: App works with mock data if not provided

---

## 📝 Quick Setup Checklist

### Minimum to Run (Basic Auth + CRUD):
- [ ] Supabase URL & Key

### To Generate Articles (Full AI Features):
- [ ] Supabase URL & Key
- [ ] OpenAI API Key
- [ ] Perplexity API Key

### Full Features (Everything):
- [ ] All of the above
- [ ] Gemini API Key (optional)
- [ ] Finnhub API Key (optional)

---

## 🎯 For Bootcamp Demo

**Minimum Required:**
1. ✅ Supabase (database)
2. ✅ OpenAI (show AI generation)
3. ✅ Perplexity (show research)

**You can demo:**
- User registration/login ✅
- Article CRUD ✅
- AI article generation ✅
- Personalized feeds ✅
- Bookmarks ✅

**Without optional keys:**
- Market ticker shows mock data (still works!)
- Images use DALL-E instead of Gemini (still works!)

---

## 💰 Estimated Costs

**For Bootcamp Demo (1-2 days of testing):**
- Supabase: **FREE**
- OpenAI: **~$1-5** (depends on how many articles you generate)
- Perplexity: **FREE** (5 requests/day) or **~$1-2** (paid tier)
- Gemini: **FREE** (if used)
- Finnhub: **FREE**

**Total: ~$2-7 for full demo**

---

## 🔐 Security Notes

1. **NEVER commit `.env` files to git** (already in `.gitignore`)
2. **Don't share API keys** publicly
3. **Rotate keys** if accidentally exposed
4. **Use environment variables** in production (not hardcoded)

---

## 📋 Where to Add Keys

### Backend `.env` file:
```env
# REQUIRED
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx

# OPTIONAL
GEMINI_API_KEY=xxxxx
FINNHUB_API_KEY=xxxxx
```

### Frontend `.env` file:
```env
# Only needs backend URL (no API keys here!)
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start

1. **Get Supabase** (2 minutes)
   - Sign up → Create project → Copy URL & key

2. **Get OpenAI** (2 minutes)
   - Sign up → Add payment → Create API key

3. **Get Perplexity** (2 minutes)
   - Sign up → Settings → API → Generate key

4. **Add to `backend/.env`**
   - Copy `.env.example` to `.env`
   - Paste your keys

5. **Run the app!**

---

## ❓ FAQ

**Q: Can I use the app without OpenAI/Perplexity?**
A: Yes, but AI agents won't work. You can still:
- Register/login users ✅
- Create articles manually ✅
- View articles ✅
- Use bookmarks ✅

**Q: How much will OpenAI cost?**
A: ~$0.01-0.10 per article. For 10 articles = ~$0.10-1.00

**Q: Can I use free tiers?**
A: Yes! All services have free tiers:
- Supabase: FREE (generous limits)
- OpenAI: Pay-as-you-go (no free tier, but cheap)
- Perplexity: FREE (5 requests/day)
- Gemini: FREE tier
- Finnhub: FREE tier

**Q: What if I don't have keys yet?**
A: You can still:
- Set up the app locally
- Test user authentication
- Test CRUD operations
- See the beautiful UI

Just won't be able to generate AI articles until you add OpenAI + Perplexity keys.

