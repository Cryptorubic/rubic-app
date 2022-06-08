const fs = require('fs');
const path = require('path');

try {
  const timestampPath = path.join(__dirname, '..', 'src', 'app', 'timestamp.ts');
  const stamp = new Date().toISOString();
  const fileContent = `export const timestamp = '${stamp}';
`;

  fs.writeFileSync(timestampPath, fileContent);
  console.log('timestamp was successfully written')
} catch (err) {
  console.debug('Cant find timestamp file');
}

