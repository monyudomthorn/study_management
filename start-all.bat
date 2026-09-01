@echo off
title Start Full-Stack Study Management System
echo ==========================================================
echo   Launching PHP Laravel Backend and React Frontend
echo ==========================================================
echo.

start "Laravel Backend (Port 8000)" cmd /k "%~dp0start-backend.bat"
start "React Frontend (Port 3000)" cmd /k "cd /d %~dp0 && npm run dev"

echo Backend and Frontend have been launched!
echo - Frontend: http://localhost:3000
echo - Backend API: http://127.0.0.1:8000/api
echo - MySQL Database: study_management
echo.
