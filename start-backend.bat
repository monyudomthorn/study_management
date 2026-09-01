@echo off
title Laravel Backend Server (Port 8000)
echo ========================================================
echo   Starting PHP Laravel API Server for Study Management
echo ========================================================
echo.

set PATH=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;C:\laragon\bin\composer;C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin;C:\xampp\php;%PATH%

cd /d "%~dp0backend"
php artisan serve --port=8000
pause
