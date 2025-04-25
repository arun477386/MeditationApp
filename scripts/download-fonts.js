const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
  {
    name: 'PTSerif-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/ptserif/v17/EJRVQgYoZZY2vCFuvAFWzro.ttf'
  },
  {
    name: 'PTSerif-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/ptserif/v17/EJRSQgYoZZY2vCFuvAnt66qSVy4.ttf'
  }
];

const fontsDir = path.join(__dirname, '../assets/fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

fonts.forEach(font => {
  const filePath = path.join(fontsDir, font.name);
  const file = fs.createWriteStream(filePath);
  
  https.get(font.url, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${font.name}`);
    });
  }).on('error', err => {
    fs.unlink(filePath);
    console.error(`Error downloading ${font.name}:`, err.message);
  });
}); 