# Notes2Test.AI Startup Script (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File START.ps1

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     NOTES2TEST.AI - STARTUP SCRIPT (PowerShell)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Check and install backend dependencies
if (-Not (Test-Path "backend\node_modules")) {
    Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    Write-Host "[✓] Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check and install frontend dependencies
if (-Not (Test-Path "frontend\node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "[✓] Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Start backend
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow
Write-Host "Backend will run on http://localhost:5000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; npm run dev"
Start-Sleep -Seconds 3

# Start frontend
Write-Host "[4/4] Starting frontend development server..." -ForegroundColor Yellow
Write-Host "Frontend will run on http://localhost:5173" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"
Start-Sleep -Seconds 3

# Display final message
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "     STARTUP COMPLETE" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend is running at: http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend is running at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser to: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop the servers" -ForegroundColor Yellow
Write-Host ""
