@echo off
REM AlgoBurn Local Development Startup Script (Windows)
REM This script starts all services for local development

echo.
echo ========================================
echo Starting AlgoBurn Local Development
echo ========================================
echo.

REM Check if .env files exist
echo Checking configuration files...

if not exist "frontend\backend-relayer\.env" (
    echo [ERROR] frontend\backend-relayer\.env not found
    echo Run: copy frontend\backend-relayer\.env.example frontend\backend-relayer\.env
    echo Then edit it with your configuration
    pause
    exit /b 1
)

if not exist "frontend\.env.local" (
    echo [ERROR] frontend\.env.local not found
    echo Run: copy frontend\.env.example frontend\.env.local
    echo Then edit it with your configuration
    pause
    exit /b 1
)

if not exist "agent-api\.env" (
    echo [ERROR] agent-api\.env not found
    echo Run: copy agent-api\.env.example agent-api\.env
    echo Then edit it with your configuration
    pause
    exit /b 1
)

echo [OK] All configuration files found
echo.

REM Check dependencies
echo Checking dependencies...

if not exist "frontend\backend-relayer\node_modules" (
    echo Installing backend relayer dependencies...
    cd frontend\backend-relayer
    call npm install
    cd ..\..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

if not exist "enterprise-api\node_modules" (
    echo Installing enterprise API dependencies...
    cd enterprise-api
    call npm install
    cd ..
)

echo [OK] All dependencies installed
echo.

REM Start services in new windows
echo Starting services...
echo.

echo Starting Backend Relayer...
start "AlgoBurn - Backend Relayer" cmd /k "cd frontend\backend-relayer && npm start"
timeout /t 2 /nobreak >nul

echo Starting Enterprise API...
start "AlgoBurn - Enterprise API" cmd /k "cd enterprise-api && npm start"
timeout /t 2 /nobreak >nul

echo Starting AI Agent...
start "AlgoBurn - AI Agent" cmd /k "cd agent-api && python agent.py"
timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "AlgoBurn - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo [OK] All services started!
echo ========================================
echo.
echo Service URLs:
echo   Frontend:        http://localhost:5173
echo   Backend Relayer: http://localhost:3001
echo   Enterprise API:  http://localhost:3000
echo   AI Agent:        (background worker, check logs)
echo.
echo Test the flow:
echo   1. Open http://localhost:5173
echo   2. Login with any test email
echo   3. Grant consent (mints NFT)
echo   4. Revoke consent (burns NFT)
echo   5. Check http://localhost:3000 for purged data
echo.
echo To stop: Close the command windows
echo.
echo ========================================
pause
