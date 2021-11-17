import fs from 'fs';
import path from 'path';
import _ from 'lodash';


const processPath = process.argv[1];
const regExp = /{{\s*'([\w.\s]+)'\s*\|\s*translate\s*}}/g;
const jsons = [];
const jsonsPaths = [];
readJSONs();

const files = process.argv.slice(2);
files.forEach(filePath => {
  const keys = findKeysIntoFile(filePath);
  keys.forEach(key => {
    jsons.forEach((obj, index) => {
      const value = _.get(obj, key);
      if (!value) {
        const msg = `Translation ${key} from ${filePath} not found in ${jsonsPaths[index]}.`;
        throw new Error(msg);
      }
    })
  })
});

process.exit(0);

function readJSONs() {
  const basePath = path.join(processPath, '../../src/assets/i18n');
  const jsonsInDir = fs.readdirSync(basePath).filter(file => path.extname(file) === '.json');

  jsonsInDir.forEach(file => {
    const fileData = fs.readFileSync(path.join(basePath, file));
    jsons.push(JSON.parse(fileData.toString()));
    jsonsPaths.push(path.join(basePath, file));
  });
}

function findKeysIntoFile(path) {
  const fileData = fs.readFileSync(path).toString();
  return Array.from(fileData.matchAll(regExp)).map(items => items[1]);
}
