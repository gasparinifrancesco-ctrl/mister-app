@echo off
title United Carpi - Server
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%

echo Avvio United Carpi (Juniores elite)...
echo Non chiudere questa finestra finche' stai usando l'app.
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul && start "" http://localhost:3000"

call npm run dev
