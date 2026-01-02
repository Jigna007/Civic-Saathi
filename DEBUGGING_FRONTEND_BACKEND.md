# 🐛 Frontend-Backend Connection Debugging

## Issue Analysis

Your frontend is showing 404 errors:

```
/api/users/username/user:1  404
/api/issues  404
```

But the backend is working fine:

```
✅ https://web-production-14e5.up.railway.app/api/users/username/admin  200
✅ https://web-production-14e5.up.railway.app/api/issues  200
```

---

## Root Cause

The frontend is calling `/api/issues` instead of `https://web-production-14e5.up.railway.app/api/issues`

This means **`VITE_API_URL` environment variable is NOT set in Vercel**.

---

## Solution: Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com
2. Select your project: `civic-saathi`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add/Update `VITE_API_URL`

Make sure these variables are set:

```
VITE_FIREBASE_API_KEY = your_firebase_key
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_GEMINI_API_KEY = your_gemini_key
VITE_API_URL = https://web-production-14e5.up.railway.app
```

### Step 3: Redeploy

1. After adding variables, go to **Deployments**
2. Click the latest deployment
3. Click **"Redeploy"**

Wait 2-3 minutes for the redeploy to complete.

---

## Verify It's Working

After redeployment:

1. Go to https://civic-saathi.vercel.app
2. Open DevTools (F12) → **Console**
3. Try to login
4. Check **Network tab** for API calls
5. You should see requests going to `https://web-production-14e5.up.railway.app/api/*`

---

## Quick Checklist

- [ ] Environment variables are set in Vercel
- [ ] Variables include `VITE_API_URL`
- [ ] Vercel project is redeployed
- [ ] No 404 errors in browser console
- [ ] Network requests show Railway URLs
