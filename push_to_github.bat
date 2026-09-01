@echo off
echo =========================================================
echo   Pushing B.Tech Learning Platform to GitHub
echo   Repository: https://github.com/utkal99377/engineering-study.git
echo =========================================================
echo.
git branch -M main
git remote set-url origin https://github.com/utkal99377/engineering-study.git
git push -u origin main --force
echo.
echo =========================================================
echo   Push Complete!
echo =========================================================
pause
