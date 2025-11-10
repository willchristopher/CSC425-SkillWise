#!/bin/bash

# SkillWise - Simple Startup Script

echo "🚀 Starting SkillWise..."
echo ""

# Create logs directory
mkdir -p logs

# Kill existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🔧 Starting backend..."
(cd backend && nohup npm start > ../logs/backend.log 2>&1 &)
sleep 3

# Start frontend
echo "⚛️ Starting frontend..."
(cd frontend && nohup npm start > ../logs/frontend.log 2>&1 &)
sleep 2

echo ""
echo "✅ Servers started!"
echo ""
echo "Backend:  http://localhost:3001/api"
echo "Frontend: http://localhost:3000"
echo ""
echo "Logs: tail -f logs/backend.log"
echo "Stop: ./stop.sh"
echo ""
