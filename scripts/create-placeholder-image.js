const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a simple world map placeholder
const width = 800;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = '#F4CCB4';
ctx.fillRect(0, 0, width, height);

// Draw continents (simplified shapes)
ctx.fillStyle = '#D3ACA0';
// North America
ctx.beginPath();
ctx.moveTo(150, 100);
ctx.lineTo(250, 50);
ctx.lineTo(300, 150);
ctx.lineTo(200, 200);
ctx.closePath();
ctx.fill();

// South America
ctx.beginPath();
ctx.moveTo(250, 200);
ctx.lineTo(300, 250);
ctx.lineTo(350, 350);
ctx.lineTo(200, 300);
ctx.closePath();
ctx.fill();

// Europe
ctx.beginPath();
ctx.moveTo(400, 100);
ctx.lineTo(450, 50);
ctx.lineTo(500, 100);
ctx.lineTo(450, 150);
ctx.closePath();
ctx.fill();

// Asia
ctx.beginPath();
ctx.moveTo(500, 50);
ctx.lineTo(650, 100);
ctx.lineTo(700, 200);
ctx.lineTo(550, 150);
ctx.closePath();
ctx.fill();

// Africa
ctx.beginPath();
ctx.moveTo(450, 200);
ctx.lineTo(500, 250);
ctx.lineTo(550, 300);
ctx.lineTo(400, 250);
ctx.closePath();
ctx.fill();

// Australia
ctx.beginPath();
ctx.moveTo(650, 300);
ctx.lineTo(700, 250);
ctx.lineTo(750, 300);
ctx.lineTo(700, 350);
ctx.closePath();
ctx.fill();

// Save the image
const imagesDir = path.join(__dirname, '../assets/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(imagesDir, 'world-map.png'), buffer);
console.log('Created placeholder world map image'); 