const { Jimp } = require('jimp');
const path = require('path');

const files = ['amma.png', 'daughter.png', 'chattakam.png', 'chappal.png', 'belan.png'];

async function processImage(file) {
  const filePath = path.join(__dirname, file);
  console.log(`Processing ${file}...`);
  try {
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    image.scan(0, 0, width, height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // If pixel is white or near-white studio backdrop
      if (r > 205 && g > 205 && b > 205) {
        this.bitmap.data[idx + 3] = 0; // 100% transparent!
      } else if (r > 185 && g > 185 && b > 185) {
        const avg = (r + g + b) / 3;
        const alpha = Math.max(0, Math.round(255 - (avg - 185) * 12));
        this.bitmap.data[idx + 3] = Math.min(this.bitmap.data[idx + 3], alpha);
      }
    });

    await image.write(filePath);
    console.log(`Successfully updated ${file} with transparent background.`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}

async function run() {
  for (const f of files) {
    await processImage(f);
  }
}

run();
