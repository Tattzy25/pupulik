const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Input PNG file
const inputFile = path.join(__dirname, '..', 'assets', 'PNG PUPULIK.png');

// iOS App Icon sizes (App Store + iPhone)
const iosSizes = [
  { size: 1024, name: 'AppIcon-1024x1024@1x.png', folder: 'ios' },
  { size: 180, name: 'AppIcon-60x60@3x.png', folder: 'ios' },
  { size: 120, name: 'AppIcon-60x60@2x.png', folder: 'ios' },
  { size: 167, name: 'AppIcon-83.5x83.5@2x.png', folder: 'ios' },
  { size: 152, name: 'AppIcon-76x76@2x.png', folder: 'ios' },
  { size: 76, name: 'AppIcon-76x76@1x.png', folder: 'ios' },
  { size: 80, name: 'AppIcon-40x40@2x.png', folder: 'ios' },
  { size: 58, name: 'AppIcon-29x29@2x.png', folder: 'ios' },
  { size: 87, name: 'AppIcon-29x29@3x.png', folder: 'ios' },
  { size: 40, name: 'AppIcon-40x40@1x.png', folder: 'ios' },
  { size: 29, name: 'AppIcon-29x29@1x.png', folder: 'ios' }
];

// Android App Icon sizes (Google Play + various densities)
const androidSizes = [
  { size: 512, name: 'ic_launcher-playstore.png', folder: 'android' },
  { size: 192, name: 'mipmap-xxxhdpi/ic_launcher.png', folder: 'android' },
  { size: 144, name: 'mipmap-xxhdpi/ic_launcher.png', folder: 'android' },
  { size: 96, name: 'mipmap-xhdpi/ic_launcher.png', folder: 'android' },
  { size: 72, name: 'mipmap-hdpi/ic_launcher.png', folder: 'android' },
  { size: 48, name: 'mipmap-mdpi/ic_launcher.png', folder: 'android' },
  { size: 192, name: 'mipmap-xxxhdpi/ic_launcher_round.png', folder: 'android' },
  { size: 144, name: 'mipmap-xxhdpi/ic_launcher_round.png', folder: 'android' },
  { size: 96, name: 'mipmap-xhdpi/ic_launcher_round.png', folder: 'android' },
  { size: 72, name: 'mipmap-hdpi/ic_launcher_round.png', folder: 'android' },
  { size: 48, name: 'mipmap-mdpi/ic_launcher_round.png', folder: 'android' }
];

async function resizeIcons() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error('Input file not found:', inputFile);
      process.exit(1);
    }

    console.log('Starting icon generation from:', inputFile);

    // Create output directories
    const outputDir = path.join(__dirname, '..', 'generated_icons');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process iOS icons
    console.log('Generating iOS icons...');
    const iosDir = path.join(outputDir, 'ios');
    if (!fs.existsSync(iosDir)) {
      fs.mkdirSync(iosDir, { recursive: true });
    }

    for (const icon of iosSizes) {
      const outputPath = path.join(iosDir, icon.name);
      await sharp(inputFile)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${outputPath}`);
    }

    // Process Android icons
    console.log('Generating Android icons...');
    const androidDir = path.join(outputDir, 'android');
    
    for (const icon of androidSizes) {
      const iconDir = path.join(androidDir, path.dirname(icon.name));
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      
      const outputPath = path.join(androidDir, icon.name);
      await sharp(inputFile)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${outputPath}`);
    }

    console.log('All icons generated successfully!');
    console.log(`Output directory: ${outputDir}`);
    
    // Display summary
    console.log('\n=== ICON GENERATION SUMMARY ===');
    console.log('iOS icons generated:', iosSizes.length);
    console.log('Android icons generated:', androidSizes.length);
    console.log('Total icons:', iosSizes.length + androidSizes.length);
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Check if sharp is available
if (fs.existsSync(path.join(__dirname, '..', 'node_modules', 'sharp'))) {
  resizeIcons();
} else {
  console.log('Sharp library not found. Installing...');
  console.log('Run: npm install sharp');
  process.exit(1);
}