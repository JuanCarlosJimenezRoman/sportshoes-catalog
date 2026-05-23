# backend/setup-pg.bat
@echo off
echo ====================================
echo    MIGRACION A POSTGRESQL
echo ====================================
echo.
echo [1/4] Instalando dependencias...
call npm install
echo.
echo [2/4] Generando cliente Prisma...
call npx prisma generate
echo.
echo [3/4] Ejecutando migracion...
call npx prisma migrate dev --name init
echo.
echo [4/4] Poblando base de datos...
call npm run db:seed
echo.
echo ====================================
echo    MIGRACION COMPLETADA!
echo ====================================
echo.
echo Credenciales:
echo   Email: admin@sportshoes.com
echo   Password: Admin123!
echo.
pause