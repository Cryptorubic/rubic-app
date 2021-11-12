module.exports = {
  '**/*.{ts, js}': 'eslint --fix',
  '**/*.css': 'stylelint --fix',
  '**/*.scss': 'stylelint --syntax=scss --fix',
  '**/*.json': 'jsonlint -q',
  '**/*.html': 'node scripts/lint-i18n.mjs'
};
