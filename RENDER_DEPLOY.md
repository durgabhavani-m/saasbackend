# Render Deployment – Fix MongoDB & Start Command Errors

## ⚠️ CRITICAL: Two Required Fixes

Your deploy fails for two reasons. Do **both**:

---

### Fix 1: Change Start Command in Render (REQUIRED)

Render is running `nodemon server.js`, which is wrong for production. You must change it:

1. Go to [Render Dashboard](https://dashboard.render.com/) → your service
2. Click **Settings** (left sidebar)
3. Scroll to **Build & Deploy**
4. Find **Start Command**
5. **Clear** the existing value (`nodemon server.js`)
6. Enter: `npm start`
7. Click **Save Changes**
8. Go to **Manual Deploy** → **Deploy latest commit**

---

### Fix 2: Add MongoDB Atlas IP Whitelist (REQUIRED)

Atlas blocks Render’s IPs. Allow access from anywhere:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) → your project
2. Click **Database** (left sidebar) → **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
5. Click **Confirm**

> Use strong DB credentials. Atlas will send an alert when 0.0.0.0/0 is added.

---

### Environment Variables in Render

Render Dashboard → Environment:

| Variable        | Required | Description                         |
|-----------------|----------|-------------------------------------|
| `MONGO_URI`     | Yes      | MongoDB Atlas connection string     |
| `JWT_SECRET`    | Yes      | Secret for JWT tokens               |
| `FRONTEND_URL`  | Yes      | Frontend URL (e.g. Vercel)          |
| `SENDGRID_API_KEY` | No    | For emails                          |
| `EMAIL_FROM`    | No       | Sender email                        |

Leave `PORT` blank; Render sets it.

---

### Optional: Use Blueprint Instead of Manual Config

To use `render.yaml` from this repo:

1. Render Dashboard → **New** → **Blueprint**
2. Connect repo: `durgabhavani-m/saasbackend`
3. Render will apply `buildCommand` and `startCommand` from `render.yaml`
4. Add `MONGO_URI` (and other secrets) in Environment
