@echo off
echo =========================================================================
echo   B.Tech Learning, Assessment & Programming Practice Platform (v2.0)
echo =========================================================================
echo.
echo Starting FastAPI Backend on http://localhost:8001 ...
start "B.Tech Backend (FastAPI)" cmd /k "python backend\run_backend.py"

echo.
echo Starting Vite Frontend Client on http://localhost:5173 ...
start "B.Tech Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo   Platform Services Started!
echo   Frontend Web Portal:  http://localhost:5173
echo   Admin CMS:            http://localhost:5173 (Login as Admin)
echo   Backend REST API:     http://localhost:8001
echo   Swagger UI API Docs:  http://localhost:8001/docs
echo.
echo   Demo Accounts:
echo     Student: student@btechlearn.edu  /  Student@2026
echo     Admin:   Protected (Requires Admin Master Passcode)
echo =========================================================================
pause
