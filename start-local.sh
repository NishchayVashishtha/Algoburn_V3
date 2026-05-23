#!/bin/bash

# AlgoBurn Local Development Startup Script
# This script starts all services for local development

echo "🔥 Starting AlgoBurn Local Development Environment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
echo "📋 Checking configuration files..."

if [ ! -f "frontend/backend-relayer/.env" ]; then
    echo -e "${RED}❌ frontend/backend-relayer/.env not found${NC}"
    echo "   Run: cp frontend/backend-relayer/.env.example frontend/backend-relayer/.env"
    echo "   Then edit it with your configuration"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}❌ frontend/.env.local not found${NC}"
    echo "   Run: cp frontend/.env.example frontend/.env.local"
    echo "   Then edit it with your configuration"
    exit 1
fi

if [ ! -f "agent-api/.env" ]; then
    echo -e "${RED}❌ agent-api/.env not found${NC}"
    echo "   Run: cp agent-api/.env.example agent-api/.env"
    echo "   Then edit it with your configuration"
    exit 1
fi

echo -e "${GREEN}✅ All configuration files found${NC}"
echo ""

# Check if node_modules exist
echo "📦 Checking dependencies..."

if [ ! -d "frontend/backend-relayer/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing backend relayer dependencies...${NC}"
    cd frontend/backend-relayer && npm install && cd ../..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

if [ ! -d "enterprise-api/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing enterprise API dependencies...${NC}"
    cd enterprise-api && npm install && cd ..
fi

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Start services
echo "🚀 Starting services..."
echo ""

# Function to start a service in a new terminal
start_service() {
    local name=$1
    local command=$2
    local dir=$3
    
    echo -e "${GREEN}Starting $name...${NC}"
    
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$dir && $command\""
    # For Linux with gnome-terminal
    elif command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="$name" -- bash -c "cd $dir && $command; exec bash"
    # For Linux with xterm
    elif command -v xterm &> /dev/null; then
        xterm -T "$name" -e "cd $dir && $command; bash" &
    # Fallback: run in background
    else
        echo -e "${YELLOW}⚠️  Could not open new terminal. Running in background...${NC}"
        cd $dir && $command &
        cd ..
    fi
}

# Start each service
start_service "Backend Relayer" "npm start" "frontend/backend-relayer"
sleep 2

start_service "Enterprise API" "npm start" "enterprise-api"
sleep 2

start_service "AI Agent" "python agent.py" "agent-api"
sleep 2

start_service "Frontend" "npm run dev" "frontend"

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📡 Service URLs:"
echo "   Frontend:        http://localhost:5173"
echo "   Backend Relayer: http://localhost:3001"
echo "   Enterprise API:  http://localhost:3000"
echo "   AI Agent:        (background worker, check logs)"
echo ""
echo "🧪 Test the flow:"
echo "   1. Open http://localhost:5173"
echo "   2. Login with any test email"
echo "   3. Grant consent (mints NFT)"
echo "   4. Revoke consent (burns NFT)"
echo "   5. Check http://localhost:3000 for purged data"
echo ""
echo "🛑 To stop all services:"
echo "   Close the terminal windows or press Ctrl+C in each"
echo ""
echo "=================================================="
