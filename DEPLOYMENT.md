# 🚀 Deployment Guide — Radha Rani Paridhan

This guide walks you through deploying the full-stack Radha Rani Paridhan website to production.

---

## 🏗️ Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌───────────┐
│  Frontend   │ ───► │   Backend    │ ───► │  MongoDB  │
│  (Next.js)  │      │  (Express)   │      │  (Atlas)  │
│   Vercel    │      │ Railway/Render│      │   Cloud   │
└─────────────┘      └──────────────┘      └───────────┘
                                              ▲
                                              │
┌─────────────┐                               │
│  Images     │ ──────────────────────────────┘
│ (Cloudinary)│
└─────────────┘
```

| Component | Recommended Host | Free Tier |
|-----------|-----------------|-----------|
| Frontend  | Vercel          | ✅ Yes    |
| Backend   | Railway / Render | ✅ Yes   |
| Database  | MongoDB Atlas   | ✅ Yes    |
| Images    | Cloudinary      | ✅ Yes    |

---

## Step 1: Pre-requisites (Cloud Services)

You already have the credentials for these from our local development, but you'll need them ready for deployment:

1. **MongoDB Atlas URI**
2. **Cloudinary** (Cloud Name, API Key, API Secret, Upload Preset)

---

## Step 2: Push to GitHub

Both Vercel and Railway deploy directly from your GitHub repository.

1. Open your terminal in the project root (`c:\Users\ajsgr\Desktop\Projects\radha-rani-paridhan-website`).
2. Run the following commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production"
   ```
3. Go to [github.com/new](https://github.com/new) and create a new repository.
4. Follow the instructions to push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/radha-rani-paridhan.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend (Railway or Render)

[Render](https://render.com) or [Railway](https://railway.app) are perfect for the Node.js Express backend.

### Using Render (Recommended for Free Tier)
1. Go to [Render](https://render.com) and click **"New" -> "Web Service"**.
2. Connect your GitHub account and select your repository.
3. **Important settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add the following **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `FRONTEND_URL` | `https://your-frontend-url.vercel.app` (You'll update this after Step 4) |
   | `MONGODB_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | A random 32+ char string |
   | `REFRESH_TOKEN_SECRET` | A different random string |
   | `ADMIN_SECRET_KEY_HASH`| (Leave blank to use the default `17Feb1981` during setup, or add a bcrypt hash) |
   | `CLOUDINARY_CLOUD_NAME`| Your Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY`   | Your Cloudinary API Key |
   | `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret |
   | `CLOUDINARY_UPLOAD_PRESET`| e.g., `products_upload` |

5. Click **Create Web Service**. Wait for it to deploy and copy the backend URL.

---

## Step 4: Deploy Frontend (Vercel)

[Vercel](https://vercel.com) is the creator of Next.js and the best place to host the frontend.

1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository.
3. Leave the **Root Directory** as `./` (the default).
4. Vercel will auto-detect Next.js.
5. In the **Environment Variables** section, add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | The URL of your Render/Railway backend (e.g., `https://radha-api.onrender.com`) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Your Cloudinary Upload Preset |

6. Click **Deploy**. Vercel will give you a live URL (e.g., `https://radha-rani.vercel.app`).

**Post-deployment fix:**
Now that you have your Vercel URL, go back to your Backend (Render/Railway), and update the `FRONTEND_URL` environment variable to match your new Vercel URL. This ensures CORS works securely.

---

## Step 5: Verify the Deployment

1. Visit your Vercel URL. The homepage should load.
2. Go to `https://your-vercel-app.com/admin`.
3. Log in with your admin key (`17Feb1981` if you haven't changed the default logic).
4. Go to **Products** and try adding a test product with an image to confirm Cloudinary and MongoDB are fully wired up in the cloud.

---

## Need Help?
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
