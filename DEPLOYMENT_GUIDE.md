# 🚀 Frontend Hosting & Deployment Guide

This project is a high-performance, standalone React SPA (Single Page Application) with **LocalStorage** persistence. It requires zero backend servers or external databases, making deployment fast, free, and straightforward.

---

## 🌟 Method 1: Deploy on Vercel (Recommended & 1-Click)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure frontend LocalStorage study management system"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New...** ➔ **Project**.
4. Import your repository (`study_management`).
5. Keep default build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Vercel will build and assign an instant HTTPS domain with automatic routing via `vercel.json`!

---

## 🔷 Method 2: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and log in.
2. Click **Add new site** ➔ **Import an existing project**.
3. Select GitHub and choose your repository.
4. Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

---

## 💻 Running Locally

To run locally on your machine:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

All your data (subjects, teachers, practices, assignments, student profiles, languages, and settings) is stored and synchronized automatically in your browser's **LocalStorage**.

