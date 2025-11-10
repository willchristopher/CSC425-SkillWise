#!/bin/bash

# SkillWise Application Startup Script
# This script starts both backend and frontend servers concurrently

echo "🚀 Starting SkillWise Application..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CSC425-SkillWise root directory"
    exit 1
fi

# Kill any existing processes on ports 3000 and 3001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend in the background
echo "� Starting backend server on port 3001..."
cd backend
npm start > /tmp/skillwise-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 2

# Start frontend in the background
echo "⚛️  Starting frontend server on port 3000..."
cd frontend
npm start > /tmp/skillwise-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📊 Backend:  http://localhost:3001/api"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "📄 Logs:"
echo "   Backend:  tail -f /tmp/skillwise-backend.log"
echo "   Frontend: tail -f /tmp/skillwise-frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up trap to catch Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait




# Start frontend in the background# Wait for backend to start

echo "⚛️  Starting frontend server on port 3000..."sleep 2

cd frontend

npm start &# Start frontend

FRONTEND_PID=$!echo "🎨 Starting frontend development server..."

cd ..cd frontend

npm start &

echo ""FRONTEND_PID=$!

echo "✅ Both servers are starting!"echo "Frontend PID: $FRONTEND_PID"

echo ""cd ..

echo "📊 Backend:  http://localhost:3001/api"

echo "🌐 Frontend: http://localhost:3000"echo ""

echo ""echo "✅ SkillWise is starting up!"

echo "Backend PID: $BACKEND_PID"echo ""

echo "Frontend PID: $FRONTEND_PID"echo "📍 Services:"

echo ""echo "   Frontend: http://localhost:3000"

echo "Press Ctrl+C to stop both servers"echo "   Backend:  http://localhost:3001/api"

echo ""echo "   Database: localhost:5433"

echo ""

# Function to handle cleanup on exitecho "💡 To stop: Run ./stop.sh or press Ctrl+C in the frontend window"

cleanup() {echo ""

    echo ""echo "📝 Logs:"

    echo "🛑 Stopping servers..."echo "   Backend: tail -f /tmp/skillwise-backend.log"

    kill $BACKEND_PID 2>/dev/null || trueecho ""

    kill $FRONTEND_PID 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up trap to catch Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
