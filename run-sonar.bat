@echo off
echo =======================================================
echo    MENJALANKAN SONARQUBE STATIC CODE ANALYSIS
echo =======================================================
echo.
echo Menjalankan audit kriteria SonarQube & analisis kode...
echo.
call npm run sonar
echo.
pause
