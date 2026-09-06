const { Jimp } = require('jimp');
const path = require('path');

async function cleanAmmaBackground() {
  const filePath = path.join(__dirname, 'amma.png');
  console.log('Cleaning up Amma background...');

  try {
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Flood fill matrix to track visited background pixels
    const visited = Array.from({ length: height }, () => new Array(width).fill(false));
    const queue = [];

    // Helper to check if pixel is background-like (light/off-white studio backdrop)
    function isBackground(r, g, b, a) {
      if (a === 0) return true;
      const brightness = (r + g + b) / 3;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const saturation = maxC - minC;

      // Background condition: high brightness or low saturation light gray/white
      return brightness > 150 && saturation < 45;
    }

    // Add border pixels to queue
    for (let x = 0; x < width; x++) {
      queue.push([x, 0]);
      queue.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
      queue.push([0, y]);
      queue.push([width - 1, y]);
    }

    // BFS Flood Fill from outer edges
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      if (x < 0 || x >= width || y < 0 || y >= height || visited[y][x]) continue;

      visited[y][x] = true;
      const idx = (y * width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      const a = image.bitmap.data[idx + 3];

      if (isBackground(r, g, b, a)) {
        image.bitmap.data[idx + 3] = 0; // Set to 100% transparent

        // Add 4-connected neighbors
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }

    // Second pass: smooth edge anti-aliasing around Amma's silhouette
    image.scan(0, 0, width, height, function (x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];

      if (a > 0) {
        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);

        // Remove any remaining floating light specks
        if (brightness > 165 && saturation < 35) {
          this.bitmap.data[idx + 3] = 0;
        }
      }
    });

    await image.write(filePath);
    console.log('Successfully cleaned Amma background 100%!');
  } catch (err) {
    console.error('Error cleaning Amma background:', err);
  }
}

cleanAmmaBackground();
