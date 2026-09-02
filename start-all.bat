@echo off
title Start Study Management Frontend
echo ==========================================================
echo   Launching React Frontend
echo ==========================================================
echo.

start "React Frontend (Port 3000)" cmd /k "cd /d %~dp0 && npm run dev"

echo Frontend has been launched!
echo - Frontend: http://localhost:3000
echo.
