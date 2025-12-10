# ✅ Port 5000 Issue - FIXED!

## What Happened
Port 5000 is used by macOS AirPlay Receiver by default.

## Solution Applied
Changed Flask to use **port 5001** instead.

## Files Updated
- ✅ `backend/app.py` - Changed port to 5001
- ✅ `frontend/.env` - Updated API URL to port 5001

---

## 🚀 Start Your Server

**In your terminal (you're in `backend/`):**

```bash
source venv/bin/activate
python3 app.py
```

You should see:
```
 * Running on http://127.0.0.1:5001
```

---

## ✅ Test It

**In another terminal:**
```bash
curl http://localhost:5001/api/health
```

Should return:
```json
{"status":"healthy","message":"The Wire Journal API is running"}
```

---

## 📝 Frontend Connection

Your frontend is already configured to use port 5001:
- `frontend/.env` has: `VITE_API_URL=http://localhost:5001/api`

Just start the frontend:
```bash
cd frontend
npm run dev
```

---

## 🎯 Alternative: Use Port 5000

If you want to use port 5000, disable AirPlay Receiver:
1. System Settings → General → AirDrop & Handoff
2. Turn off "AirPlay Receiver"

Then change port back to 5000 in `app.py`.

---

**Your backend is ready to run on port 5001!** 🎉

