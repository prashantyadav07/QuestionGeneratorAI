@echo off
REM Run this script to start the entire application
REM Make sure you have Node.js and npm installed

echo.
echo =========================================================
echo     NOTES2TEST.AI - STARTUP SCRIPT
echo =========================================================
echo.

REM Check if backend node_modules exists
if not exist "backend\node_modules" (
    echo [1/4] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [✓] Backend dependencies installed
    echo.
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo [✓] Frontend dependencies installed
    echo.
)

echo [3/4] Starting backend server...
echo Backend will run on http://localhost:5000
start "Backend - Notes2Test.AI" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

echo [4/4] Starting frontend development server...
echo Frontend will run on http://localhost:5173
start "Frontend - Notes2Test.AI" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

echo.
echo =========================================================
echo     STARTUP COMPLETE
echo =========================================================
echo.
echo ✅ Backend is running at: http://localhost:5000
echo ✅ Frontend is running at: http://localhost:5173
echo.
echo Open your browser to: http://localhost:5173
echo.
echo Press Ctrl+C in each terminal to stop the servers
echo.
pause
