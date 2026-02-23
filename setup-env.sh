#!/bin/bash

# Setup Environment Variables Script
# ==================================
# This script helps set up .env files for both backend and frontend

echo "🚀 Setting up environment variables for Meraki Coffee House..."

# Function to create .env file
create_env_file() {
    local file_path=$1
    local content=$2

    if [ -f "$file_path" ]; then
        echo "⚠️  $file_path already exists. Skipping..."
        return
    fi

    echo "$content" > "$file_path"
    echo "✅ Created $file_path"
}

# Backend .env content
BACKEND_ENV="# Backend Environment Configuration
# =================================

# Server Configuration
PORT=5005
NODE_ENV=development

# Database Configuration
# MongoDB Atlas connection string for production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meraki_prod?retryWrites=true&w=majority
# Local MongoDB for development
MONGODB_URI=mongodb://localhost:27017/meraki

# Session Configuration
# Generate a secure random string for production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-64-characters-minimum

# CORS Configuration
# Frontend URL for CORS (use your actual domain in production)
FRONTEND_URL=http://localhost:5006

# Security Configuration
# Set to true in production for HTTPS
# COOKIE_SECURE=false
# COOKIE_SAMESITE=lax

# Logging (optional)
# LOG_LEVEL=info

# Rate Limiting (optional)
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100"

# Frontend .env content
FRONTEND_ENV="# Frontend Environment Configuration
# ===================================

# Server Configuration
PORT=5006
NODE_ENV=development

# API Configuration
# Backend API URL (use your actual domain in production)
# API_URL=https://your-backend-domain.com/api
# Local backend for development
API_URL=http://localhost:5005/api

# Security Configuration (optional)
# CONTENT_SECURITY_POLICY=default-src 'self'

# Analytics (optional)
# GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# CDN Configuration (optional)
# CDN_URL=https://cdn.yourdomain.com"

# Create .env files
create_env_file "backend/.env" "$BACKEND_ENV"
create_env_file "frontend/.env" "$FRONTEND_ENV"

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and update SESSION_SECRET with a secure random string"
echo "2. Update MONGODB_URI if using MongoDB Atlas in production"
echo "3. Update FRONTEND_URL and API_URL with your actual domains in production"
echo ""
echo "🔐 For production, also create:"
echo "   - backend/.env.production"
echo "   - frontend/.env.production"
echo ""
echo "📚 See the templates in:"
echo "   - backend/env_template.txt"
echo "   - backend/production_env_template.txt"
echo "   - frontend/env_template.txt"
echo "   - frontend/production_env_template.txt"