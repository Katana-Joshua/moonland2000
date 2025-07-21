# Create Environment Files

## Frontend Environment File

Create a file named `.env` in the root directory with this content:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

## Backend Environment File

Create a file named `.env` in the server directory with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=moonland_pos
DB_PORT=3306

# JWT Configuration
JWT_SECRET=moonland_pos_jwt_secret_key_2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Steps to Create:

1. **Frontend .env file:**
   ```bash
   # In the root directory (C:\xampp\htdocs\demomain)
   echo VITE_API_URL=http://localhost:5000/api > .env
   echo VITE_BACKEND_URL=http://localhost:5000 >> .env
   ```

2. **Backend .env file:**
   ```bash
   # In the server directory (C:\xampp\htdocs\demomain\server)
   echo PORT=5000 > .env
   echo NODE_ENV=development >> .env
   echo DB_HOST=localhost >> .env
   echo DB_USER=root >> .env
   echo DB_PASSWORD= >> .env
   echo DB_NAME=moonland_pos >> .env
   echo DB_PORT=3306 >> .env
   echo JWT_SECRET=moonland_pos_jwt_secret_key_2024 >> .env
   echo JWT_EXPIRES_IN=24h >> .env
   echo CORS_ORIGIN=http://localhost:5173 >> .env
   echo RATE_LIMIT_WINDOW_MS=900000 >> .env
   echo RATE_LIMIT_MAX_REQUESTS=100 >> .env
   ```

## After Creating Environment Files:

1. **Restart your server:**
   ```bash
   cd server
   npm start
   ```

2. **Restart your frontend:**
   ```bash
   # In another terminal, from the root directory
   npm run dev
   ```

3. **Test image serving:**
   - Go to your browser
   - Navigate to: `http://localhost:5000/api/images/item-1753034670577-119`
   - You should see the image or get a proper error message

4. **Check the console:**
   - Open browser developer tools
   - Look for any CORS errors or image loading errors
   - The server console should show detailed logs when images are requested 