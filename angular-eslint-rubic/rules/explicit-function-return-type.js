const { isSetter, isConstructor } = require('../utils/utils');

module.exports.checkFunctionReturnType = (context) => {
  const defaultWhiteList = [
    'ngOnChanges',
    'ngOnInit',
    'ngDoCheck',
    'ngAfterContentInit',
    'ngAfterContentChecked',
    'ngAfterViewInit',
    'ngAfterViewChecked',
    'ngOnDestroy'
  ];
  const whiteList = context?.options?.[0]?.exclude || defaultWhiteList;
  return {
    FunctionExpression: (node) => {
      const name = node.parent?.key?.name;
      if (!node.returnType && !whiteList.includes(name) && !isConstructor(name) && !isSetter(node.parent)) {
        context.report({
          node,
          message: 'Return type missing. Use right return value type instead of explicit any.'
        });
      }
    },
  };
};
