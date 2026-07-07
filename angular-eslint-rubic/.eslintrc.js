module.exports = {
  overrides: [
    {
      parserOptions: {
        ecmaVersion: 11,
        // projectService: true,
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      env: {
        es6: true
      }
    }
  ]
};
