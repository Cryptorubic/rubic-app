module.exports = {
  '**/*.{ts,html}': (files) => {
    const patterns = files.map((f) => `--lint-file-patterns="${f}"`).join(' ');
    return `node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng lint rubic --fix ${patterns} --cache`;
  },
  '**/*.css': 'stylelint --fix',
  '**/*.scss': 'stylelint --syntax=scss --fix',
  '**/*.json': 'jsonlint -q',
  '**/*.html': (files) => `node scripts/lint-i18n.mjs ${files.join(' ')}`
};
