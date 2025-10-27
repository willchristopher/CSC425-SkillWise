#!/bin/bash

# SkillWise - Easy Startup Script
# This script starts the database, backend, and frontend

echo "🚀 Starting SkillWise Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Start database
echo "📊 Starting PostgreSQL database..."
docker-compose up database -d
sleep 3

# Start backend in background
echo "⚙️  Starting backend API server..."
cd backend
node server.js > /tmp/skillwise-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ SkillWise is starting up!"
echo ""
echo "📍 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api"
echo "   Database: localhost:5433"
echo ""
echo "💡 To stop: Run ./stop.sh or press Ctrl+C in the frontend window"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f /tmp/skillwise-backend.log"
echo ""
