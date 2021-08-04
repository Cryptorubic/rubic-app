const fs = require('fs');

/* patch maticjs */
const maticFile = 'node_modules/@maticnetwork/meta/network/index.js';

fs.readFile(maticFile, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(
    /const networks = require\("\.\/networks"\)/,
    'const networks = require("./networks.json")'
  );
  fs.writeFile(maticFile, result, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
  });
});
