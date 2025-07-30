#!/usr/bin/env node

/**
 * App Icon Generator Script
 * Generates all required app icon sizes from the SVG logo
 * 
 * Usage: node generate_icons.js
 * Requires: imagemagick or similar image processing tool
 * 
 * Note: This is a template script - you'll need to run with actual image processing
 */

const fs = require('fs');
const path = require('path');

// Icon sizes for different platforms
const iconSizes = {
  ios: [
    { size: 20, scales: [2, 3], prefix: 'icon-20x20' },
    { size: 29, scales: [2, 3], prefix: 'icon-29x29' },
    { size: 40, scales: [2, 3], prefix: 'icon-40x40' },
    { size: 60, scales: [2, 3], prefix: 'icon-60x60' },
    { size: 76, scales: [1, 2], prefix: 'icon-76x76' },
    { size: 83.5, scales: [2], prefix: 'icon-83.5x83.5' },
    { size: 1024, scales: [1], prefix: 'icon-1024x1024' }
  ],
  android: [
    { size: 48, density: 'mdpi' },
    { size: 72, density: 'hdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 192, density: 'xxxhdpi' },
    { size: 512, density: 'store' }
  ]
};

console.log('🎨 Pupulik App Icon Generator');
console.log('================================');

// Create directories
const dirs = [
  'ios/ExplicitContentScanner/Images.xcassets/AppIcon.appiconset',
  'android/app/src/main/res/mipmap-mdpi',
  'android/app/src/main/res/mipmap-hdpi',
  'android/app/src/main/res/mipmap-xhdpi',
  'android/app/src/main/res/mipmap-xxhdpi',
  'android/app/src/main/res/mipmap-xxxhdpi'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Generate iOS icons
console.log('\n📱 Generating iOS Icons...');
iconSizes.ios.forEach(icon => {
  icon.scales.forEach(scale => {
    const actualSize = Math.round(icon.size * scale);
    const filename = `${icon.prefix}@${scale}x.png`;
    console.log(`  📏 ${actualSize}x${actualSize} -> ${filename}`);
    
    // Note: Actual image generation would require imagemagick or similar
    // Example command: convert assets/pupulik-svg.svg -resize ${actualSize}x${actualSize} ios/path/${filename}
  });
});

// Generate Android icons
console.log('\n🤖 Generating Android Icons...');
iconSizes.android.forEach(icon => {
  const filename = `ic_launcher.png`;
  const dir = `android/app/src/main/res/mipmap-${icon.density}`;
  console.log(`  📏 ${icon.size}x${icon.size} -> ${dir}/${filename}`);
  
  // Note: Actual image generation would require imagemagick or similar
  // Example command: convert assets/pupulik-svg.svg -resize ${icon.size}x${icon.size} android/path/${filename}
});

console.log('\n✅ Icon generation template created!');
console.log('\n🔧 To generate actual icons:');
console.log('1. Install ImageMagick: brew install imagemagick');
console.log('2. Use an online SVG to PNG converter or design tool');
console.log('3. Create icons manually using the sizes above');
console.log('4. Place icons in the appropriate directories');
console.log('\n📱 Recommended tools:');
console.log('- Online: https://appicon.co/');
console.log('- Figma plugin: "App Icon Generator"');
console.log('- Xcode: Built-in asset catalog tools');