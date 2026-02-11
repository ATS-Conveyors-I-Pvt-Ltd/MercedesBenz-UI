#!/bin/bash

# Mercedes-Benz Digital Assembly Platform
# Initial Setup Script
# This script sets up the development environment

set -e  # Exit on error

echo "🚀 Mercedes-Benz Digital Assembly Platform - Setup Script"
echo "=========================================================="
echo ""

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Setup environment file
echo "⚙️  Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update .env with your email credentials"
else
    echo "ℹ️  .env file already exists (skipping)"
fi
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/audit-reports
mkdir -p data/exports
mkdir -p logs
echo "✅ Directories created"
echo ""

# Check if SQL Server is needed
echo "🔍 Checking database configuration..."
echo "ℹ️  This application uses file-based logging by default"
echo "ℹ️  SQL Server is optional and not required for basic functionality"
echo ""

# Final instructions
echo "✅ Setup complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Update .env file with your email configuration"
echo "      - See docs/setup/EMAIL_SETUP.md for detailed instructions"
echo ""
echo "   2. Start the development server:"
echo "      npm run dev"
echo ""
echo "   3. Access the application:"
echo "      - Frontend: http://localhost:5174"
echo "      - Backend API: http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - docs/FILE_STRUCTURE.md - Folder structure"
echo "   - docs/setup/EMAIL_SETUP.md - Email configuration"
echo "   - docs/business/EXECUTIVE_SUMMARY.md - Business overview"
echo ""
echo "🎉 Happy coding!"
