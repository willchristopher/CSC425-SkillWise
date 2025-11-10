#!/bin/bash#!/bin/bash



# SkillWise Application Shutdown Script# SkillWise - Stop Script

# This script stops both backend and frontend servers# This script stops all SkillWise services



echo "🛑 Stopping SkillWise Application..."echo "🛑 Stopping SkillWise Application..."



# Kill processes on ports 3000 and 3001# Kill Node processes on ports 3000 and 3001

echo "🧹 Killing processes on ports 3000 and 3001..."echo "Stopping frontend and backend..."

lsof -ti:3001 | xargs kill -9 2>/dev/null || truelsof -ti:3000 | xargs kill -9 2>/dev/null

lsof -ti:3000 | xargs kill -9 2>/dev/null || truelsof -ti:3001 | xargs kill -9 2>/dev/null



# Also kill any node processes running server.js# Stop database container

pkill -f "node server.js" 2>/dev/null || trueecho "Stopping database..."

pkill -f "react-scripts start" 2>/dev/null || truedocker-compose down



echo "✅ All servers stopped"echo "✅ All services stopped"

