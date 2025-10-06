#!/bin/bash

echo "🚀 Setting up Content Publisher App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if ports 3000 and 5000 are available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3000 is already in use. Please free up port 3000 for the frontend."
    exit 1
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 5000 is already in use. Please free up port 5000 for the backend."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env file"
    echo "⚠️  Please update the JWT_SECRET in backend/.env for production use"
else
    echo "✅ Backend environment file already exists"
fi

# Build the projects
echo "🛠️  Building projects..."
echo "Building backend..."
cd backend && npm run build && cd ..
echo "Building frontend..."
cd frontend && npm run build && cd ..


echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend: http://localhost:5000"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "To run separately:"
echo "  Backend:  npm run server"
echo "  Frontend: npm run client"
echo ""
echo "Happy coding! 🚀"