# Build APK PowerShell Helper
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  B.Tech Learning Platform - APK Builder" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$flutterCmd = Get-Command flutter -ErrorAction SilentlyContinue

if (-not $flutterCmd) {
    Write-Host "[!] Flutter SDK not found in PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options to build APK:" -ForegroundColor White
    Write-Host "1. Install Flutter locally using winget:" -ForegroundColor Green
    Write-Host "   winget install Google.Flutter" -ForegroundColor Gray
    Write-Host "   winget install Google.AndroidStudio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Or download Flutter SDK directly from:" -ForegroundColor Green
    Write-Host "   https://docs.flutter.dev/get-started/install/windows" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Or push this repository to GitHub - the included GitHub Action" -ForegroundColor Green
    Write-Host "   (.github/workflows/build_apk.yml) will automatically build the APK for you in 2 minutes." -ForegroundColor Gray
    exit 1
}

Write-Host "[+] Flutter detected: $((Get-Command flutter).Source)" -ForegroundColor Green
Set-Location $PSScriptRoot

Write-Host "[*] Fetching dependencies (flutter pub get)..." -ForegroundColor Yellow
flutter pub get

Write-Host "[*] Building Release APK..." -ForegroundColor Yellow
flutter build apk --release --android-skip-build-dependency-validation

if ($LASTEXITCODE -eq 0) {
    $apkSource = "$PSScriptRoot\build\app\outputs\flutter-apk\app-release.apk"
    $apkDest = "$PSScriptRoot\..\btech_learning_platform_release.apk"
    Copy-Item $apkSource $apkDest -Force
    Write-Host ""
    Write-Host "[SUCCESS] APK built successfully!" -ForegroundColor Green
    Write-Host "[+] Copied to: $apkDest" -ForegroundColor Cyan
    Write-Host "Location: $apkSource" -ForegroundColor Cyan
    Invoke-Item "$PSScriptRoot\build\app\outputs\flutter-apk"
} else {
    Write-Host "[!] APK build failed. Please verify your Android SDK configuration." -ForegroundColor Red
}
