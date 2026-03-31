# 🚀 Launch Checklist — Radha Rani Paridhan Ajmer

Complete these steps in order to go fully live with a custom domain.

---

## ✅ Step 1: Push Latest Changes to GitHub

Your code has changed (new theme, WhatsApp checkout, name update). Push it all.

Open a terminal in your project folder and run:

```bash
git add .
git commit -m "WhatsApp checkout, light theme, brand name update"
git push origin main
```

---

## ✅ Step 2: Deploy Backend (Render.com)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo (`radha-rani-paridhan`)
3. Set these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`

4. Add these **Environment Variables** in Render:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `MONGODB_URI` | `mongodb+srv://admin:17Feb1981@cluster0.06kkirv.mongodb.net/radharani?retryWrites=true&w=majority&appName=Cluster0&tls=true` |
   | `JWT_SECRET` | Any random 32+ character string |
   | `REFRESH_TOKEN_SECRET` | Any different random 32+ character string |
   | `ADMIN_SECRET_KEY` | `17Feb1981` |
   | `CLOUDINARY_CLOUD_NAME` | `dyr8igeyb` |
   | `CLOUDINARY_API_KEY` | `777166664263883` |
   | `CLOUDINARY_API_SECRET` | `HXs-1e3YASpeYtH5w5l8hcbUBQ0` |
   | `CLOUDINARY_UPLOAD_PRESET` | `products_upload` |
   | `FRONTEND_URL` | *(leave blank for now, fill in after Step 3)* |

5. Click **Deploy**. Wait for it to finish.
6. Copy your backend URL — it will look like: `https://radha-rani-backend.onrender.com`

---

## ✅ Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo (`radha-rani-paridhan`)
3. Leave Root Directory as `./` (default)
4. Add these **Environment Variables** in Vercel:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Your Render backend URL from Step 2 (e.g. `https://radha-rani-backend.onrender.com`) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dyr8igeyb` |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `products_upload` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `918078676085` |

5. Click **Deploy**. Wait for it to finish.
6. Copy your Vercel URL — it will look like: `https://radha-rani-paridhan.vercel.app`

---

## ✅ Step 4: Link Frontend URL to Backend

1. Go back to **Render** → your backend service → **Environment**
2. Set `FRONTEND_URL` to your Vercel URL (e.g. `https://radha-rani-paridhan.vercel.app`)
3. Click **Save Changes** — Render will auto-redeploy

This is required so the backend's CORS policy allows requests from your frontend.

---

## ✅ Step 5: Verify the Live Site

Open your Vercel URL and test:

- [ ] Homepage loads with products from the database
- [ ] Click a product → product detail page works
- [ ] Add to cart → cart drawer opens
- [ ] Go to checkout → fill in details → click **Order via WhatsApp**
- [ ] WhatsApp opens with the pre-filled order message
- [ ] Go to `/admin` → login with `17Feb1981` → dashboard shows products

---

## ✅ Step 6: Add a Custom Domain (Optional)

### Buy a domain
Get one from [GoDaddy](https://godaddy.com), [Namecheap](https://namecheap.com), or [Google Domains](https://domains.google).

Suggested name: `radharaniparidhan.com` or `radharaniparidhanajmer.com`

### Point domain to Vercel (Frontend)

1. In Vercel → your project → **Settings → Domains**
2. Click **Add** and type your domain (e.g. `radharaniparidhan.com`)
3. Vercel will show you DNS records to add. Go to your domain registrar and add:

   | Type | Name | Value |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

4. Wait 10–30 minutes for DNS to propagate
5. Vercel will auto-issue an SSL certificate (your site will be `https://`)

### Point API subdomain to Render (Optional but clean)

If you want `api.radharaniparidhan.com` instead of the render URL:

1. In your domain registrar, add:

   | Type | Name | Value |
   |---|---|---|
   | `CNAME` | `api` | Your render app URL (without `https://`) |

2. In Render → **Settings → Custom Domains** → add `api.radharaniparidhan.com`
3. Update `NEXT_PUBLIC_API_URL` in Vercel to `https://api.radharaniparidhan.com`
4. Update `FRONTEND_URL` in Render to `https://radharaniparidhan.com`

---

## ✅ Step 7: Final Checks Before Going Live

- [ ] Update the footer "Handcrafted with love in Varanasi" text if needed (`app/page.js` line ~115)
- [ ] Replace seed product images with your actual product photos (via Admin → Products)
- [ ] Test on mobile — everything should be responsive
- [ ] Share your live link! 🎉

---

## 🔐 Keep These Safe (Never Share Publicly)

| Secret | Value |
|---|---|
| MongoDB Password | `17Feb1981` |
| Cloudinary API Secret | `HXs-1e3YASpeYtH5w5l8hcbUBQ0` |
| Admin Key | `17Feb1981` |
| JWT Secret | *(whatever you set in Render)* |

> [!CAUTION]
> Never commit `.env` files to GitHub. They are already in `.gitignore` — keep it that way.
