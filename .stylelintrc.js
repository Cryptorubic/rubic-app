module.exports = {
  plugins: ['stylelint-scss'],
  extends: ['stylelint-config-sass-guidelines', 'stylelint-config-rational-order'],
  rules: {
    /* Ordering */
    'plugin/rational-order': [true, {
      'border-in-box-model': false,
      'empty-line-between-groups': true,
    }],
    /* css rules */
    'selector-type-no-unknown': null,
    'at-rule-no-unknown': null,
    'order/properties-alphabetical-order': null,
    'max-nesting-depth': 8, // Better if <= 4. Now it's 8 because of current css state of project.
    'selector-no-vendor-prefix': null,
    'media-feature-name-no-vendor-prefix': null,
    'length-zero-no-unit': null,
    'value-no-vendor-prefix': null,
    'declaration-property-value-disallowed-list': null,
    'selector-no-qualifying-type': null,
    'selector-max-compound-selectors': null,
    'selector-class-pattern': null,
    'selector-pseudo-element-no-unknown': null,
    'selector-max-id': [1, { 'severity': 'warning' }],
    'color-named': null,
    'property-disallowed-list': [],
    'property-no-vendor-prefix': null,
    /* scss rules */
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-redundant-nesting-selector': true,
    'scss/dollar-variable-pattern': null,
    'scss/at-function-pattern': null,
    'scss/at-mixin-pattern': null,
    'scss/at-extend-no-missing-placeholder': null
  }
}
