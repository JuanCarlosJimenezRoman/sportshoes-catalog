@echo off
echo ====================================
echo    SPORTSHOES BACKEND - SETUP
echo ====================================
echo.
echo [1/4] Instalando dependencias...
call npm install
echo.
echo [2/4] Generando cliente Prisma...
call npx prisma generate
echo.
echo [3/4] Creando base de datos...
call npx prisma db push
echo.
echo [4/4] Poblando base de datos...
call node prisma/seed.js
echo.
echo ====================================
echo    SETUP COMPLETADO CON EXITO!
echo ====================================
echo.
echo Comandos disponibles:
echo   npm run dev        - Iniciar servidor
echo   npm run db:studio  - Ver base de datos
echo   npm run db:reset   - Reiniciar base de datos
echo.
pause