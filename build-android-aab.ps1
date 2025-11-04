# PowerShell script to build and sign Android AAB with automatic version increment
# Usage: .\build-android-aab.ps1

Write-Host "🚀 Building Android AAB with automatic version increment..." -ForegroundColor Green

# Navigate to Android directory
Set-Location -Path "android"

# Read current version
$buildGradle = Get-Content "app\build.gradle"
$currentVersionCode = ($buildGradle | Select-String "versionCode (\d+)").Matches.Groups[1].Value
$currentVersionName = ($buildGradle | Select-String "versionName ""([\d.]+)""").Matches.Groups[1].Value

Write-Host "📦 Current Version: $currentVersionName (code: $currentVersionCode)" -ForegroundColor Yellow

# Increment version
$newVersionCode = [int]$currentVersionCode + 1
$versionParts = $currentVersionName.Split('.')
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]
$newPatch = $patch + 1
$newVersionName = "$major.$minor.$newPatch"

Write-Host "📦 New Version: $newVersionName (code: $newVersionCode)" -ForegroundColor Cyan

# Update build.gradle
(Get-Content "app\build.gradle") | 
    ForEach-Object {
        $_ -replace "versionCode $currentVersionCode", "versionCode $newVersionCode" `
           -replace "versionName ""$currentVersionName""", "versionName ""$newVersionName"""
    } | Set-Content "app\build.gradle"

Write-Host "✅ Updated build.gradle with new version" -ForegroundColor Green

# Clean and build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
& .\gradlew clean

Write-Host "🔨 Building signed AAB..." -ForegroundColor Yellow
& .\gradlew bundleRelease

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📦 AAB location: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Cyan
    Write-Host "📊 New version: $newVersionName (versionCode: $newVersionCode)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host "✨ Done!" -ForegroundColor Green








