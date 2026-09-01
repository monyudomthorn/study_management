# 🚀 Backend Hosting & Deployment Guide

This guide will walk you through hosting your **PHP Laravel Backend** and **MySQL Database** online on **Railway** (Recommended) or **Render**.

---

## 🌟 Method 1: Host on Railway (Recommended & Easiest)

Railway provides full support for Laravel + MySQL with automatic SSL (`https://...`), environment management, and automatic database provisioning.

### Step 1: Push your Code to GitHub
1. In your terminal, initialize and push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Laravel backend, MySQL database schema, and deployment configs"
   git push origin main
   ```

### Step 2: Create a Project on Railway
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **+ New Project** ➔ **Deploy from GitHub repo**.
3. Select your repository (`Setec/System` or `study_management`).
4. In the service settings, set the **Root Directory** to: `/backend`.

### Step 3: Add MySQL Database on Railway
1. Inside your Railway project dashboard, click **+ Create** / **Add Service**.
2. Select **Database** ➔ **MySQL**.
3. Railway will generate a MySQL instance and automatically provide variables:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.

### Step 4: Configure Backend Environment Variables
In your Laravel Web Service on Railway, go to **Variables** and add:
| Variable Name | Value / Reference |
|---|---|
| `APP_NAME` | `Study Management API` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | *(Generate by running `php artisan key:generate --show` or use your base64 key)* |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_DATABASE` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |

### Step 5: Generate Public Domain
1. In your Laravel service on Railway, go to **Settings** ➔ **Networking** ➔ **Generate Domain**.
2. You will get a live URL such as: `https://study-management-production.up.railway.app`
3. Test your live backend: `https://your-domain.up.railway.app/api/ping`

---

## 🔷 Method 2: Host on Render.com

Render supports Dockerized web services and managed MySQL.

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub with the `backend/Dockerfile` and `render.yaml` files included.

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and log in.
2. Click **New +** ➔ **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically read [`render.yaml`](file:///d:/Setec/System/render.yaml) and configure:
   - **Web Service**: Dockerized Laravel application (Singapore region).
   - **Database Service**: MySQL database.
5. Click **Apply** to deploy!

---

## ⚡ Method 3: Instant Public URL (Zero-Setup with Cloudflare Tunnel / ngrok)

If you want to make your local backend and MySQL live on the internet **right now** for testing or demo without uploading to cloud servers:

### Using Cloudflare Tunnel (Free, No Signup required):
```powershell
# In PowerShell:
npx cloudflared tunnel --url http://127.0.0.1:8000
```
It will generate a live HTTPS link (e.g. `https://random-subdomain.trycloudflare.com`) that points directly to your local Laravel backend!

---

## 🔗 Connecting Your Frontend to the Hosted Backend

Once your backend is hosted online:

### If your Frontend is on Vercel / Netlify:
Add an Environment Variable in your Vercel/Netlify dashboard:
```env
VITE_API_URL=https://your-hosted-backend.up.railway.app/api
```

### If testing locally with hosted backend:
In your `.env` in the root frontend directory:
```env
VITE_API_URL=https://your-hosted-backend.up.railway.app/api
```
Rebuild or restart Vite:
```powershell
npm run build
npm run dev
```

---

## 📋 Database Import on Remote MySQL (Workbench)
You can connect MySQL Workbench directly to your hosted Railway/Render database:
1. In Railway/Render, copy the **Public Connection URL / Host / Port / User / Password**.
2. Open **MySQL Workbench** ➔ **+ (New Connection)**.
3. Paste the Host, Port, Username, and Password ➔ Click **Test Connection**.
4. Once connected, open and execute [`study_management.sql`](file:///d:/Setec/System/study_management.sql) to seed the remote database!
