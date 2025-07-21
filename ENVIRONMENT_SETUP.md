# Environment Setup Guide

## Overview
This guide explains how to set up environment variables for both frontend and backend to centralize all domain paths and configuration.

## Frontend Environment Setup

### 1. Create `.env` file in the root directory
Copy the `env.example` file to `.env`:

```bash
cp env.example .env
```

### 2. Configure Frontend Environment Variables

**Development (localhost):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

**Production (replace with your domain):**
```env
VITE_API_URL=https://your-domain.com/api
VITE_BACKEND_URL=https://your-domain.com
```

**Railway Deployment:**
```env
VITE_API_URL=https://your-app-name.up.railway.app/api
VITE_BACKEND_URL=https://your-app-name.up.railway.app
```

**Vercel Deployment:**
```env
VITE_API_URL=https://your-app-name.vercel.app/api
VITE_BACKEND_URL=https://your-app-name.vercel.app
```

## Backend Environment Setup

### 1. Create `.env` file in the server directory
Copy the `server/env.example` file to `server/.env`:

```bash
cd server
cp env.example .env
```

### 2. Configure Backend Environment Variables

**Development:**
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=moonland_pos
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Production:**
```env
PORT=5000
NODE_ENV=production

# Database Configuration (Hostinger)
DB_HOST=localhost
DB_USER=u407655108_pos
DB_PASSWORD=your_hostinger_password
DB_NAME=u407655108_pos
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## How It Works

### Frontend Image URL Building
The frontend now uses a centralized `buildImageUrl()` function from `src/lib/api.js`:

```javascript
import { buildImageUrl } from '@/lib/api';

// Instead of hardcoded URLs like:
// src={`http://localhost:5000${item.image}`}

// Now use:
src={buildImageUrl(item.image)}
```

### Backend CORS Configuration
The backend automatically uses the `CORS_ORIGIN` environment variable to allow requests from the frontend domain.

## Benefits

1. **Easy Deployment**: Change URLs in one place for different environments
2. **No Hardcoded URLs**: All domain paths are centralized
3. **Environment-Specific**: Different configs for dev, staging, production
4. **Security**: Sensitive data like database credentials are externalized

## Troubleshooting

### Images Not Loading
1. Check that `VITE_BACKEND_URL` matches your backend server URL
2. Verify that `CORS_ORIGIN` in backend matches your frontend URL
3. Ensure the backend server is running and accessible

### Database Connection Issues
1. Verify database credentials in `server/.env`
2. Check that the database server is running
3. Ensure the database exists and tables are created

### CORS Errors
1. Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
2. Check that both frontend and backend are using the same protocol (http/https)
3. Verify that the backend is serving images with proper CORS headers 