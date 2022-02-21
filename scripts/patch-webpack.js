const fs = require('fs');

/* patch walletlink */
const walletLinkFile = 'node_modules/walletlink/dist/relay/WalletLinkRelay.js';

fs.readFile(walletLinkFile, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/this\.ui\.reloadUI\(\);/, '// this.ui.reloadUI();');
  fs.writeFile(walletLinkFile, result, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
  });
});
