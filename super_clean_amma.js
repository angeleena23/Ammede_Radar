const { Jimp } = require('jimp');
const path = require('path');

async function superCleanAmma() {
  const filePath = path.join(__dirname, 'amma.png');
  console.log('Super cleaning Amma image...');

  try {
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    image.scan(0, 0, width, height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      const brightness = (r + g + b) / 3;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const diff = maxC - minC;

      // Amma's gown is red/pink: high red, lower green
      const isNightyGown = (r > 120 && g < 110 && b < 150 && (r - g) > 25);
      // Amma's hair/eyes/outlines are dark
      const isDarkHairOrOutline = (r < 75 && g < 75 && b < 75);
      // Amma's skin tone: r > g and g > b
      const isSkinTone = (r > 100 && g > 65 && b > 45 && r > g && (r - b) > 20);

      // If it is NOT Amma's gown, hair, or skin -> it is background!
      if (!isNightyGown && !isDarkHairOrOutline && !isSkinTone) {
        this.bitmap.data[idx + 3] = 0; // 100% Transparent!
      } else if (brightness > 180 && diff < 30) {
        // Extra check for light studio background artifacts
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write(filePath);
    console.log('Successfully super-cleaned Amma image!');
  } catch (err) {
    console.error('Error super cleaning Amma:', err);
  }
}

superCleanAmma();
