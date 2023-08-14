const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'log.txt');
const changesPath = path.join(__dirname, '..', 'files.txt');

fs.readFile(logPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const from = data.indexOf('Initial Chunk Files');
  const to = data.indexOf('Build at') - 1;

  const text = data.slice(from, to);

  if (text.length <= 3) {
    console.error('No files found');
    return;
  }

  const filesArray = [];

  text.split(/\r?\n/).forEach(line => {
    const paramsIndex = line.indexOf(' |');
    if (
      paramsIndex !== -1 &&
      !line.includes('Initial Total') &&
      !line.includes('Lazy Chunk Files') &&
      !line.includes('Initial Chunk Files')
    ) {
      const fileName = line.slice(0, paramsIndex).trimEnd();
      filesArray.push(fileName);
    }
  });

  const filesData = filesArray.map(el => `${el}\r\n`).join('');

  fs.writeFile(changesPath, filesData, { flag: 'w+' }, err => {
    if (err) console.log(err);
    console.log('Files successfully written.');
  });
});
