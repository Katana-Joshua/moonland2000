# 📁 Simple File Organization Guide

## ✅ **Test Files Removed**
All test files have been deleted from the server directory.

---

## 🎯 **Simple Organization (Keep Current Structure)**

Since your server is already in the main project directory, here's the **minimal organization** you need:

### **Current Structure (Keep This):**
```
moonland-pos/
├── src/                    # Frontend React code
├── public/                 # Frontend static files
├── server/                 # Backend Node.js code
├── package.json            # Frontend dependencies
├── server/package.json     # Backend dependencies
├── vercel.json             # Vercel config (frontend)
├── server/railway.json     # Railway config (backend)
├── .gitignore
└── [documentation files]
```

---

## 🚀 **Deployment Commands**

### **Frontend (Vercel):**
```bash
# Deploy from root directory
vercel --prod
```

### **Backend (Railway):**
```bash
# Deploy from server directory
cd server
railway up
```

---

## 📋 **What You Need to Do:**

### **1. Update Vercel Configuration:**
Make sure `vercel.json` points to the right build directory:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### **2. Update Railway Configuration:**
Make sure `server/railway.json` is correct:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### **3. Set Environment Variables:**

**In Railway (Backend):**
```bash
railway variables set DB_HOST=127.0.0.1
railway variables set DB_USER=u407655108_katana01
railway variables set DB_PASSWORD=your_password
railway variables set DB_NAME=u407655108_pos
railway variables set JWT_SECRET=your_secret
railway variables set CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**In Vercel (Frontend):**
```bash
vercel env add VITE_API_BASE_URL
# Enter: https://your-railway-app.railway.app/api
```

---

## ✅ **That's It!**

Your current structure is actually **perfect for deployment**:

- ✅ **Frontend** in root (Vercel can deploy from here)
- ✅ **Backend** in server/ (Railway can deploy from here)
- ✅ **Test files removed** (clean production code)
- ✅ **Configurations in place** (ready to deploy)

**No major reorganization needed!** 🎉

---

## 🚀 **Quick Deploy:**

1. **Deploy Backend:**
   ```bash
   cd server
   railway up
   ```

2. **Deploy Frontend:**
   ```bash
   vercel --prod
   ```

3. **Configure CORS** with your Vercel URL in Railway

**Your Moon Land POS is ready for deployment!** 🚀 