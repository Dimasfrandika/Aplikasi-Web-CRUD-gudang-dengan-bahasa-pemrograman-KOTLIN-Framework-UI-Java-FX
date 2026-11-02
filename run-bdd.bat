@echo off
echo =======================================================
echo    MENJALANKAN PENGUJIAN BDD (PLAYWRIGHT + CUCUMBER)
echo =======================================================
echo.
echo Menjalankan skenario otomatisasi: tests-bdd/features/login.feature...
echo.
call npm run test:bdd
echo.
pause
