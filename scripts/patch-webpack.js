const fs = require('fs');

/* patch web3 */
const web3File = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';

fs.readFile(web3File, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/node: false/g, 'node: {crypto: true, stream: true}');
  fs.writeFile(web3File, result, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
  });
});

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
