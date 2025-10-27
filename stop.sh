#!/bin/bash

# SkillWise - Stop Script
# This script stops all SkillWise services

echo "🛑 Stopping SkillWise Application..."

# Kill Node processes on ports 3000 and 3001
echo "Stopping frontend and backend..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Stop database container
echo "Stopping database..."
docker-compose down

echo "✅ All services stopped"
