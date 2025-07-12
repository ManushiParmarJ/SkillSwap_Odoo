@echo off
echo ========================================
echo    Skill Swap Platform Startup
echo ========================================
echo.
echo Choose an option:
echo 1. Start with default ports (Backend: 5000, Frontend: 3000)
echo 2. Start with Frontend on port 3001
echo 3. Start with Frontend on port 3002
echo 4. Start with Frontend on port 3003
echo 5. Start with Frontend on port 3004
echo 6. Start with Frontend on port 3005
echo 7. Start Backend only (port 5000)
echo 8. Start Frontend only (port 3000)
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" (
    echo Starting with default ports...
    npm run dev
) else if "%choice%"=="2" (
    echo Starting with Frontend on port 3001...
    npm run dev:3001
) else if "%choice%"=="3" (
    echo Starting with Frontend on port 3002...
    npm run dev:3002
) else if "%choice%"=="4" (
    echo Starting with Frontend on port 3003...
    npm run dev:3003
) else if "%choice%"=="5" (
    echo Starting with Frontend on port 3004...
    npm run dev:3004
) else if "%choice%"=="6" (
    echo Starting with Frontend on port 3005...
    npm run dev:3005
) else if "%choice%"=="7" (
    echo Starting Backend only...
    npm run start:backend
) else if "%choice%"=="8" (
    echo Starting Frontend only...
    npm run start:frontend
) else (
    echo Invalid choice. Please run the script again.
    pause
) 