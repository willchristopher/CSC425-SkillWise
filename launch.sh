#!/bin/bash

# SkillWise Application Launcher
# This script starts/restarts all services and opens the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SkillWise Application Launcher     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}\n"

# Stop existing containers (if any)
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
cd "$SCRIPT_DIR"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}\n"

# Build and start services
echo -e "${YELLOW}🚀 Starting services with Docker Compose...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Services started${NC}\n"

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
echo -e "   Database: initializing..."

# Check database
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec skillwise_db pg_isready -U skillwise_user -d skillwise_db > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Database ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}   ❌ Database failed to start${NC}"
    exit 1
fi

# Check Redis
echo -e "   Redis: initializing..."
max_attempts=20
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec skillwise_redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Redis ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

# Check Backend
echo -e "   Backend: initializing..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Backend ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

echo -e "\n${GREEN}✅ All services are running!${NC}\n"

# Display service information
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Service Endpoints              ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} Frontend:  ${GREEN}http://localhost:3000${NC}        ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} Backend:   ${GREEN}http://localhost:3001${NC}        ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} Database:  ${GREEN}postgres://localhost:5433${NC} ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} Redis:     ${GREEN}redis://localhost:6379${NC}   ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Prompt to open in browser
echo -e "${YELLOW}Would you like to open the application in your browser? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Opening http://localhost:3000...${NC}\n"
    sleep 2
    open "http://localhost:3000"
fi

# Show helpful commands
echo -e "${BLUE}📋 Helpful Commands:${NC}"
echo -e "   View logs:         ${YELLOW}docker compose logs -f${NC}"
echo -e "   Backend logs:      ${YELLOW}docker compose logs backend -f${NC}"
echo -e "   Frontend logs:     ${YELLOW}docker compose logs frontend -f${NC}"
echo -e "   Stop services:     ${YELLOW}docker compose down${NC}"
echo -e "   Shell access:      ${YELLOW}docker compose exec backend bash${NC}"
echo -e ""

echo -e "${GREEN}✨ Application is ready to use!${NC}"
