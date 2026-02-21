# Render Deployment Guide

## Fix: MongoDB Atlas Connection Error

If you see `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`, follow these steps:

### 1. Add IP Address to MongoDB Atlas Whitelist

Render uses dynamic IPs that change on each deploy. You must allow access from anywhere:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) → your project
2. Click **Database** (left sidebar) → **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
5. Click **Confirm**

> **Security note:** Use strong database credentials. Atlas will email you when 0.0.0.0/0 is added.

Reference: [MongoDB Atlas IP Whitelist Docs](https://www.mongodb.com/docs/atlas/security-whitelist/)

### 2. Set Environment Variables in Render

In your Render Dashboard → Service → **Environment**:

| Variable      | Description                          |
|---------------|--------------------------------------|
| `MONGO_URI`   | Your MongoDB Atlas connection string |
| `PORT`        | Leave blank (Render sets this)       |
| `FRONTEND_URL`| Your frontend URL (e.g. Vercel)      |
| `JWT_SECRET`  | Secret for JWT tokens                |
| `SENDGRID_API_KEY` | For emails (if using)           |
| `EMAIL_FROM`  | Sender email                         |

### 3. Start Command

The `render.yaml` uses `npm start` (runs `node server.js`). Do **not** use `nodemon` in production.

If you created the service manually, set **Start Command** to:
```
npm start
```

### 4. Redeploy

After updating Atlas and env vars, redeploy from the Render Dashboard.
