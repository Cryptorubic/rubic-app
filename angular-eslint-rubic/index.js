const { checkFunctionReturnType } = require('./rules/explicit-function-return-type');

module.exports = {
  rules: {
    'explicit-function-return-type': {
      create: checkFunctionReturnType
    },
  },
};
