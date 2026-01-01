# 🚀 CivicSaathi Deployment Guide

This guide will help you deploy **CivicSaathi** with:

- **Frontend** → Vercel (React + Vite)
- **Backend** → Railway (Node.js API)

---

## 📋 Prerequisites

1. GitHub account with your code pushed
2. Vercel account ([vercel.com](https://vercel.com))
3. Railway account ([railway.app](https://railway.app))
4. Firebase project setup
5. Google Gemini API key

---

## 🔧 Environment Variables Needed

### For Vercel (Frontend)

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=https://your-app.up.railway.app
```

### For Railway (Backend)

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=production
```

---

## 🚂 Step 1: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Click "New Project"** → "Deploy from GitHub repo"

3. **Select your repository**: `sih25-civic-saathi`

4. **Configure the service**:

   - Railway will auto-detect Node.js
   - It will use the `Procfile` to run `npm run backend`

5. **Add Environment Variables**:

   - Click on your service → "Variables" tab
   - Add:
     - `GEMINI_API_KEY` = your Gemini API key
     - `PORT` = 5000
     - `NODE_ENV` = production

6. **Deploy**: Railway will automatically deploy

7. **Get your Railway URL**:
   - Click "Settings" → Find your public domain
   - Example: `https://civicsaathi-production.up.railway.app`
   - **SAVE THIS URL** - you'll need it for Vercel!

---

## ☁️ Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Click "Add New..." → "Project"**

3. **Import your repository**: `sih25-civic-saathi`

4. **Configure Project**:

   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   Click "Environment Variables" and add:

   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=https://your-app.up.railway.app
   ```

   ⚠️ **IMPORTANT**: Replace `https://your-app.up.railway.app` with your actual Railway URL from Step 1!

6. **Deploy**: Click "Deploy"

7. **Get your Vercel URL**:
   - After deployment completes, you'll get a URL like:
   - `https://civicsaathi.vercel.app`

---

## 🔄 Step 3: Update Vercel Configuration

After getting your Railway URL, you need to update the API proxy in `vercel.json`:

1. Open `vercel.json` in your project
2. Find the line:
   ```json
   "destination": "https://your-railway-backend.up.railway.app/api/$1"
   ```
3. Replace with your actual Railway URL
4. Commit and push:
   ```bash
   git add vercel.json
   git commit -m "Update Railway backend URL"
   git push origin main
   ```
5. Vercel will automatically redeploy

---

## 🔐 Step 4: Update CORS on Railway

Your Railway backend needs to allow requests from Vercel:

1. The backend is already configured to accept requests from any origin in production
2. If you need to restrict it, update `server/backend-only.ts`:
   ```typescript
   app.use(
     cors({
       origin: ["https://civicsaathi.vercel.app"], // Your Vercel URL
       credentials: true,
     })
   );
   ```
3. Push the changes to trigger Railway redeploy

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at your Vercel URL
- [ ] Backend is running at your Railway URL (`/health` endpoint)
- [ ] Login works (admin/password or user/password)
- [ ] Can create new issues
- [ ] Can upvote issues
- [ ] AI analysis works (Gemini API)
- [ ] Map view displays issues
- [ ] Admin dashboard accessible

---

## 🎯 Your Deployment URLs

After completing all steps, you'll have:

```
🌐 Frontend (Vercel): https://civicsaathi.vercel.app
🔌 Backend (Railway): https://civicsaathi-production.up.railway.app
💚 Health Check: https://civicsaathi-production.up.railway.app/health
📊 API Base: https://civicsaathi-production.up.railway.app/api
```

---

## 🐛 Troubleshooting

### Frontend not connecting to backend

- Check `VITE_API_URL` environment variable in Vercel
- Verify CORS settings in Railway backend
- Check browser console for errors

### Backend errors on Railway

- Check Railway logs: Dashboard → Your Service → Deployments → View Logs
- Verify all environment variables are set
- Check that `GEMINI_API_KEY` is valid

### Build failures on Vercel

- Check that all environment variables start with `VITE_`
- Verify build command is `npm run build`
- Check Vercel build logs for specific errors

### API calls failing

- Open browser DevTools → Network tab
- Check if API calls are going to correct Railway URL
- Verify Railway service is running (check /health endpoint)

---

## 🔄 Redeployment

### Redeploy Frontend (Vercel)

- Push to GitHub main branch → Auto redeploys
- Or: Vercel Dashboard → Your Project → Redeploy

### Redeploy Backend (Railway)

- Push to GitHub main branch → Auto redeploys
- Or: Railway Dashboard → Your Service → Deploy → Redeploy

---

## 📝 Notes

- **Free Tier Limits**:
  - Railway: $5/month free credit
  - Vercel: 100GB bandwidth/month
- **Cold Starts**: Railway may have slight delay on first request after inactivity

- **Environment Variables**: Never commit `.env` file to GitHub!

- **Demo Accounts**:
  - Admin: `admin` / `password`
  - User: `user` / `password`

---

## 🎉 For Your PPT/Presentation

Include these URLs in your hackathon submission:

```
🌐 Live Demo: https://civicsaathi.vercel.app
🔗 Backend API: https://civicsaathi-production.up.railway.app
📦 GitHub Repo: https://github.com/sentinel-11/sih25-civic-saathi
```

---

Good luck with your hackathon! 🚀
