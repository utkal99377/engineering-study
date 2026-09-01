Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  B.Tech Learning, Assessment & Programming Practice Platform (v2.0)" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting FastAPI Backend Server on http://localhost:8001..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "python backend\run_backend.py"

Write-Host "Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd frontend && npm run dev"

Write-Host ""
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Admin CMS:        http://localhost:5173 (Sign in with Admin credentials)" -ForegroundColor Cyan
Write-Host "Swagger REST API: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Student: student@btechlearn.edu / Student@2026" -ForegroundColor White
Write-Host "  Admin:   admin@btechlearn.edu   / Admin@2026" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
