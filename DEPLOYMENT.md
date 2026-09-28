# 🚀 Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying the **HR Management System (HR Pulse)** to **Render** and **Vercel** in less than 5 minutes.

---

## 🛠️ Option 1: Split Deployment (Recommended)
- **Backend API**: Deployed as a Web Service on **Render**
- **Frontend SPA**: Deployed as a Fast Edge Site on **Vercel**

---

### Step 1: Deploy Backend API on Render

1. Log in to [Render.com](https://render.com) and click **"New +"** → **"Web Service"**.
2. Connect your GitHub repository: `https://github.com/Ayushukla7/HRMS`.
3. Configure the service settings:
   - **Name**: `hrms-backend`
   - **Language / Runtime**: `Node`
   - **Region**: Any (e.g. *Oregon (US West)* or *Frankfurt (EU)*)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | (Render assigns dynamically, fallback 5000) |
   | `JWT_SECRET` | *(Random secure 32+ char string)* | e.g. `super_secret_jwt_key_hrms_2026_pro_secure_token` |
   | `MONGODB_URI` | *(Optional MongoDB Atlas URI)* | *If left blank, the app auto-spins up an embedded in-memory database!* |

5. Click **"Deploy Web Service"**.
6. Once deployed, copy your Render URL: e.g. `https://hrms-backend-xxxx.onrender.com`.

---

### Step 2: Deploy Frontend on Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Import your GitHub repository: `Ayushukla7/HRMS`.
3. In the project setup configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`** (or leave root with the pre-configured `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add **Environment Variable**:
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://hrms-backend-xxxx.onrender.com/api` *(your Render backend URL)* |

5. Click **"Deploy"**.
6. Vercel will build and assign you a live production URL: e.g. `https://hrms-xxxx.vercel.app`.

---

## ⚡ Option 2: 1-Click Render Blueprint (Full Stack on Render)

If you prefer to deploy both the frontend and backend together on Render using the included `render.yaml`:

1. Go to [Render Dashboard](https://dashboard.render.com/blueprints).
2. Click **"New Blueprint Instance"**.
3. Select your repository `https://github.com/Ayushukla7/HRMS`.
4. Render will detect `render.yaml` and provision both:
   - `hrms-backend` (Node API Web Service)
   - `hrms-frontend` (Static Site with SPA rewrite rules)
5. Click **"Apply"** to launch both services instantly!

---

## 🔑 Default Production Demo Logins

Once deployed, you can log in immediately:

| Role | Email | Password |
|---|---|---|
| **HR Administrator** | `admin@hrms.com` | `admin123` |
| **Employee** | `sarah.jenkins@hrms.com` | `employee123` |

*(Or click the 1-Click **"Admin View"** / **"Employee View"** buttons on the login screen).*
