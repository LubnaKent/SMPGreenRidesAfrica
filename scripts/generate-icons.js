const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create SVG with green background and "SMP" text
const createSvg = (size) => {
  const fontSize = Math.floor(size * 0.3);
  const padding = Math.floor(size * 0.1);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${padding}" fill="url(#grad)"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-weight="bold"
        font-size="${fontSize}px"
        fill="white"
      >SMP</text>
      <text
        x="50%"
        y="${50 + fontSize * 0.6}%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-weight="normal"
        font-size="${Math.floor(fontSize * 0.4)}px"
        fill="rgba(255,255,255,0.9)"
      >GREEN RIDES</text>
    </svg>
  `;
};

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const svg = createSvg(size);
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Created: icon-${size}x${size}.png`);
  }

  // Also create favicon.ico (using 32x32)
  const faviconSvg = createSvg(32);
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.png'));
  console.log('Created: favicon.png');

  console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
