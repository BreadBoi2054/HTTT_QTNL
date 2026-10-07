@echo off
chcp 65001 >nul
:: Tu dong yeu cau quyen Administrator neu chua co
fltmc >nul 2>&1 || (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo       DANG GO BO CAC UNG DUNG THUA CON LAI (ADMIN)...
echo ========================================================

echo [1/4] Dang go bo Blackmagic RAW Common Components...
msiexec.exe /x {BF8B97B1-9BEE-422A-9893-AC7A52ACA23A} /qn /norestart

echo [2/4] Dang go bo Chrome Remote Desktop Host...
msiexec.exe /x {9CCBB3AA-219D-4A90-841E-DD59AE8A46C6} /qn /norestart

echo [3/4] Dang go bo cac cong cu Azure cu (PowerShell 2018, Authoring Tools)...
msiexec.exe /x {3BA7CAA9-97BA-4528-B7E1-B640910BB149} /qn /norestart
msiexec.exe /x {90462BD2-DF5B-449C-A401-FCC1DC264E4E} /qn /norestart
msiexec.exe /x {04ca054c-2f40-44b0-8610-8d51ec9444fe} /qn /norestart
msiexec.exe /x {7D1D9444-B5EA-4587-A81D-47377003124F} /qn /norestart

echo [4/4] Dang xoa not file rac C:\xampp...
rmdir /s /q "C:\xampp" 2>nul

echo.
echo ========================================================
echo DA HOAN TAT DON DEP!
echo ========================================================
timeout /t 5
