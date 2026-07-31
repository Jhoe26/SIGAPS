@echo off
title SIGAPS - Sistema de Gestion
echo ========================================
echo   SIGAPS - CAPI III-M Ayacucho
echo ========================================

echo Liberando puertos si estaban en uso...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Iniciando Backend...
start "Backend SIGAPS" cmd /k "cd /d %~dp0backend && .\mvnw spring-boot:run"

echo Esperando que el backend levante (20 segundos)...
timeout /t 20 /nobreak >nul

echo Iniciando Frontend...
start "Frontend SIGAPS" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
echo.
echo ========================================
echo Sistema listo:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080/api
echo   Login:    DNI 12345678 / Admin1234
echo ========================================
start "" "http://localhost:5173"
