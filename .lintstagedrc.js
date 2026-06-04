module.exports = {
  '**/*.ts': 'node --max_old_space_size=8192 ./node_modules/.bin/eslint --fix',
  '**/*.css': 'stylelint --fix',
  '**/*.scss': 'stylelint --syntax=scss --fix',
  '**/*.json': 'jsonlint -q',
  '**/*.html': 'node scripts/lint-i18n.mjs'
};
