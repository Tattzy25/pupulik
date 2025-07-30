@echo off
echo ================================================
echo 🎯 PNG PUPULIK Icon Resizer for App Store & Google Play
echo ================================================

echo Checking for PNG PUPULIK.png...
if not exist "%~dp0..\assets\PNG PUPULIK.png" (
    echo ❌ Error: PNG PUPULIK.png not found in assets folder!
    pause
    exit /b 1
)

echo ✅ Found PNG PUPULIK.png - ready to resize!

REM Create output directories
if not exist "..\app_icons" mkdir "..\app_icons"
if not exist "..\app_icons\ios" mkdir "..\app_icons\ios"
if not exist "..\app_icons\android" mkdir "..\app_icons\android"
if not exist "..\app_icons\android\mipmap-xxxhdpi" mkdir "..\app_icons\android\mipmap-xxxhdpi"
if not exist "..\app_icons\android\mipmap-xxhdpi" mkdir "..\app_icons\android\mipmap-xxhdpi"
if not exist "..\app_icons\android\mipmap-xhdpi" mkdir "..\app_icons\android\mipmap-xhdpi"
if not exist "..\app_icons\android\mipmap-hdpi" mkdir "..\app_icons\android\mipmap-hdpi"
if not exist "..\app_icons\android\mipmap-mdpi" mkdir "..\app_icons\android\mipmap-mdpi"

echo.
echo 🍎 Generating iOS App Store icons...
magick "..\assets\PNG PUPULIK.png" -resize 1024x1024 "..\app_icons\ios\AppIcon-1024x1024.png"
magick "..\assets\PNG PUPULIK.png" -resize 180x180 "..\app_icons\ios\AppIcon-60x60@3x.png"
magick "..\assets\PNG PUPULIK.png" -resize 120x120 "..\app_icons\ios\AppIcon-60x60@2x.png"
magick "..\assets\PNG PUPULIK.png" -resize 152x152 "..\app_icons\ios\AppIcon-76x76@2x.png"
magick "..\assets\PNG PUPULIK.png" -resize 76x76 "..\app_icons\ios\AppIcon-76x76@1x.png"

echo.
echo 🤖 Generating Android Google Play icons...
magick "..\assets\PNG PUPULIK.png" -resize 512x512 "..\app_icons\android\ic_launcher-playstore.png"
magick "..\assets\PNG PUPULIK.png" -resize 192x192 "..\app_icons\android\mipmap-xxxhdpi\ic_launcher.png"
magick "..\assets\PNG PUPULIK.png" -resize 144x144 "..\app_icons\android\mipmap-xxhdpi\ic_launcher.png"
magick "..\assets\PNG PUPULIK.png" -resize 96x96 "..\app_icons\android\mipmap-xhdpi\ic_launcher.png"
magick "..\assets\PNG PUPULIK.png" -resize 72x72 "..\app_icons\android\mipmap-hdpi\ic_launcher.png"
magick "..\assets\PNG PUPULIK.png" -resize 48x48 "..\app_icons\android\mipmap-mdpi\ic_launcher.png"

echo.
echo ================================================
echo ✅ ALL ICONS GENERATED SUCCESSFULLY!
echo ================================================
echo 📁 Output folder: ..\app_icons\
echo.
echo 📱 iOS icons: ..\app_icons\ios\
echo 🤖 Android icons: ..\app_icons\android\
echo.
echo 🚀 Ready for App Store & Google Play submission!
pause