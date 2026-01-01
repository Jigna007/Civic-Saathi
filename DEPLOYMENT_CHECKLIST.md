# 🚀 Deployment Checklist for CivicSaathi

Use this checklist to ensure smooth deployment to Vercel and Railway.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Ready

- [ ] Firebase API Key
- [ ] Firebase Project ID
- [ ] Firebase App ID
- [ ] Google Gemini API Key

### 2. Code Committed to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Accounts Created

- [ ] Vercel account (vercel.com)
- [ ] Railway account (railway.app)
- [ ] Both linked to GitHub

---

## 🚂 Railway Deployment (Backend)

### Step 1: Create New Project

- [ ] Go to railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `sih25-civic-saathi`

### Step 2: Configure Service

- [ ] Railway auto-detects Node.js ✓
- [ ] Uses `Procfile` to run backend ✓

### Step 3: Add Environment Variables

```
GEMINI_API_KEY = [your_gemini_key]
PORT = 5000
NODE_ENV = production
```

### Step 4: Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Service should show "Active"

### Step 5: Get Railway URL

- [ ] Go to Settings tab
- [ ] Find "Domains" section
- [ ] Copy your Railway URL (e.g., `https://civicsaathi-production.up.railway.app`)
- [ ] Test health endpoint: `https://your-url.up.railway.app/health`

**✏️ Write down your Railway URL:**

```
Railway URL: _________________________________
```

---

## ☁️ Vercel Deployment (Frontend)

### Step 1: Import Project

- [ ] Go to vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Import `sih25-civic-saathi`

### Step 2: Configure Build Settings

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
```

### Step 3: Add Environment Variables

```
VITE_FIREBASE_API_KEY = [your_firebase_api_key]
VITE_FIREBASE_PROJECT_ID = [your_firebase_project_id]
VITE_FIREBASE_APP_ID = [your_firebase_app_id]
VITE_GEMINI_API_KEY = [your_gemini_api_key]
VITE_API_URL = [your_railway_url_from_above]
```

⚠️ **CRITICAL**: Use the Railway URL you got in the previous step!

### Step 4: Deploy

- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Deployment successful!

### Step 5: Get Vercel URL

- [ ] Copy your Vercel URL (e.g., `https://civicsaathi.vercel.app`)

**✏️ Write down your Vercel URL:**

```
Vercel URL: _________________________________
```

---

## 🔄 Post-Deployment Configuration

### Update vercel.json with Railway URL

- [ ] Open `vercel.json`
- [ ] Replace `https://your-railway-backend.up.railway.app` with actual Railway URL
- [ ] Commit and push:

```bash
git add vercel.json
git commit -m "Update Railway backend URL"
git push origin main
```

- [ ] Vercel auto-redeploys

### Update Railway CORS (Optional)

If you want to restrict CORS to only your Vercel domain:

- [ ] Open `server/backend-only.ts`
- [ ] Add your Vercel URL to `allowedOrigins` array
- [ ] Commit and push
- [ ] Railway auto-redeploys

---

## 🧪 Testing Deployment

### Test Backend (Railway)

- [ ] Visit: `https://your-railway-url.up.railway.app/health`
- [ ] Should show: `{"status":"OK","timestamp":"..."}`

### Test Frontend (Vercel)

- [ ] Visit your Vercel URL
- [ ] Login with: `admin` / `password`
- [ ] Create a test issue
- [ ] Upvote an issue
- [ ] Check admin dashboard
- [ ] Test map view
- [ ] Test AI analysis (Gemini)

### Check Browser Console

- [ ] Open DevTools → Console
- [ ] No CORS errors
- [ ] No 404 errors on API calls
- [ ] API calls going to Railway URL

---

## 📊 Monitor Deployments

### Railway Monitoring

- Dashboard → Your Service → Metrics
- Check: CPU, Memory, Network usage
- View Logs: Deployments → Latest → View Logs

### Vercel Monitoring

- Dashboard → Your Project → Analytics
- Check: Page views, Load time
- View Logs: Deployments → Latest → View Function Logs

---

## 🎯 Your Final URLs

After successful deployment:

```
🌐 Frontend (Vercel):
https://civicsaathi.vercel.app

🔌 Backend (Railway):
https://civicsaathi-production.up.railway.app

💚 Health Check:
https://civicsaathi-production.up.railway.app/health

📊 API Base:
https://civicsaathi-production.up.railway.app/api

📦 GitHub Repo:
https://github.com/sentinel-11/sih25-civic-saathi
```

---

## 🐛 Common Issues & Solutions

### Issue: API calls failing (CORS errors)

**Solution:**

- Check `VITE_API_URL` in Vercel environment variables
- Verify Railway service is running
- Check Railway logs for errors

### Issue: Build fails on Vercel

**Solution:**

- Verify all `VITE_*` environment variables are set
- Check build logs for missing dependencies
- Ensure `dist/public` directory is being created

### Issue: Railway service offline

**Solution:**

- Check Railway credits ($5/month free tier)
- View deployment logs for errors
- Verify environment variables are set

### Issue: Blank page on Vercel

**Solution:**

- Open browser console for errors
- Check if API URL is correct
- Verify Railway backend is running

---

## 📱 For Hackathon Presentation

### Slide 1: Project Overview

- Name: CivicSaathi
- Tagline: AI-Powered Civic Issue Management

### Slide 2: Live Demo Links

```
🌐 Live App: https://civicsaathi.vercel.app
🔗 Backend: https://civicsaathi-production.up.railway.app
📦 GitHub: https://github.com/sentinel-11/sih25-civic-saathi
```

### Slide 3: Test Credentials

- Admin: `admin` / `password`
- User: `user` / `password`

---

## ✅ Final Checklist

Before submission:

- [ ] Both deployments are live
- [ ] Frontend connects to backend
- [ ] All features working
- [ ] Demo credentials work
- [ ] URLs added to PPT
- [ ] GitHub repo is public
- [ ] README.md is updated

---

🎉 **Congratulations! Your app is deployed!** 🎉
