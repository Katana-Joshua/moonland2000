#!/bin/bash

echo "🚀 Organizing Moon Land POS for Deployment..."

# Step 1: Create directories
echo "📁 Creating directories..."
mkdir -p frontend backend docs scripts

# Step 2: Move frontend files
echo "🎨 Moving frontend files..."
mv src/ frontend/ 2>/dev/null || echo "src/ already moved or doesn't exist"
mv public/ frontend/ 2>/dev/null || echo "public/ already moved or doesn't exist"
mv package.json frontend/ 2>/dev/null || echo "package.json already moved or doesn't exist"
mv package-lock.json frontend/ 2>/dev/null || echo "package-lock.json already moved or doesn't exist"
mv vite.config.js frontend/ 2>/dev/null || echo "vite.config.js already moved or doesn't exist"
mv tailwind.config.js frontend/ 2>/dev/null || echo "tailwind.config.js already moved or doesn't exist"
mv postcss.config.js frontend/ 2>/dev/null || echo "postcss.config.js already moved or doesn't exist"
mv index.html frontend/ 2>/dev/null || echo "index.html already moved or doesn't exist"
mv vercel.json frontend/ 2>/dev/null || echo "vercel.json already moved or doesn't exist"
mv .nvmrc frontend/ 2>/dev/null || echo ".nvmrc already moved or doesn't exist"

# Step 3: Move backend files
echo "🔧 Moving backend files..."
mv server/* backend/ 2>/dev/null || echo "server/ files already moved or doesn't exist"
rmdir server 2>/dev/null || echo "server/ directory already removed or doesn't exist"

# Step 4: Move documentation files
echo "📚 Moving documentation files..."
mv DEPLOYMENT_GUIDE.md docs/ 2>/dev/null || echo "DEPLOYMENT_GUIDE.md already moved or doesn't exist"
mv PRE_GITHUB_CHECKLIST.md docs/ 2>/dev/null || echo "PRE_GITHUB_CHECKLIST.md already moved or doesn't exist"
mv INTEGRATED_STAFF_USER_GUIDE.md docs/ 2>/dev/null || echo "INTEGRATED_STAFF_USER_GUIDE.md already moved or doesn't exist"
mv IMAGE_OPTIMIZATION_GUIDE.md docs/ 2>/dev/null || echo "IMAGE_OPTIMIZATION_GUIDE.md already moved or doesn't exist"
mv IMAGE_UPLOAD_GUIDE.md docs/ 2>/dev/null || echo "IMAGE_UPLOAD_GUIDE.md already moved or doesn't exist"
mv HOSTINGER_SETUP_GUIDE.md docs/ 2>/dev/null || echo "HOSTINGER_SETUP_GUIDE.md already moved or doesn't exist"
mv MIGRATION_SCRIPT.md docs/ 2>/dev/null || echo "MIGRATION_SCRIPT.md already moved or doesn't exist"

# Step 5: Move development scripts
echo "🛠️ Moving development scripts..."
mv tools/ scripts/ 2>/dev/null || echo "tools/ already moved or doesn't exist"
mv backend/migrate-existing-staff.js scripts/ 2>/dev/null || echo "migrate-existing-staff.js already moved or doesn't exist"
mv backend/create-user.js scripts/ 2>/dev/null || echo "create-user.js already moved or doesn't exist"
mv backend/create-single-user.js scripts/ 2>/dev/null || echo "create-single-user.js already moved or doesn't exist"
mv backend/check-staff.js scripts/ 2>/dev/null || echo "check-staff.js already moved or doesn't exist"
mv backend/fix-all-users-staff.js scripts/ 2>/dev/null || echo "fix-all-users-staff.js already moved or doesn't exist"
mv backend/add-user-id-to-staff.sql scripts/ 2>/dev/null || echo "add-user-id-to-staff.sql already moved or doesn't exist"

# Step 6: Remove test files from backend
echo "🧹 Cleaning up test files..."
rm -f backend/test-*.js
rm -f backend/check-*.js
rm -f backend/create-*.js
rm -f backend/fix-*.js
rm -f backend/migrate-*.js

# Step 7: Create root README
echo "📝 Creating root README..."
cat > README.md << 'EOF'
# Moon Land POS System

A modern Point of Sale system built with React, Node.js, and MySQL.

## 🏗️ Project Structure

- `frontend/` - React application (deployed to Vercel)
- `backend/` - Node.js server (deployed to Railway)
- `docs/` - Documentation and guides
- `scripts/` - Development and migration scripts

## 🚀 Quick Start

### Frontend (Vercel)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Railway)
```bash
cd backend
npm install
npm start
```

## 📚 Documentation

See the `docs/` directory for detailed guides:
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [GitHub Setup](docs/PRE_GITHUB_CHECKLIST.md)
- [Staff Management](docs/INTEGRATED_STAFF_USER_GUIDE.md)

## 🛠️ Development

### Prerequisites
- Node.js 18+
- MySQL database
- Git

### Setup
1. Clone the repository
2. Install dependencies: `npm install` (in both frontend and backend)
3. Set up environment variables
4. Start development servers

## 📄 License

Private - Business Use Only
EOF

echo "✅ Organization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test frontend: cd frontend && npm install && npm run dev"
echo "2. Test backend: cd backend && npm install && npm start"
echo "3. Deploy backend: cd backend && railway up"
echo "4. Deploy frontend: cd frontend && vercel --prod"
echo ""
echo "📁 Your project is now organized for deployment!" 