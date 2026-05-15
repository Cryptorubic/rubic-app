const { defineConfig } = require('eslint/config');
const _import = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');
// const angularRubic = require('eslint-plugin-angular-rubic');
const rxjsX = require('eslint-plugin-rxjs-x').default;

const { fixupPluginRules } = require('@eslint/compat');

const jasmine = require('eslint-plugin-jasmine');
const sortKeysFix = require('eslint-plugin-sort-keys-fix');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {}
    }
  },
  {
    files: ['**/*.ts'],

    plugins: {
      import: fixupPluginRules(_import),
      'unused-imports': fixupPluginRules(unusedImports)
      // 'angular-rubic': angularRubic,
    },

    extends: [
      ...compat.extends(
        'plugin:@angular-eslint/recommended',
        'airbnb-typescript/base'
        // 'plugin:prettier/recommended',
      ),
      rxjsX.configs.recommended
    ],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './src/tsconfig.app.json'],
        tsconfigRootDir: __dirname
      }
    },

    rules: {
      'import/prefer-default-export': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      'no-plusplus': 'off',
      'class-method-use-this': 'off',
      'no-underscore-dangle': 'off',
      'no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 2,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/lines-between-class-members': 0,
      '@typescript-eslint/no-throw-literal': 0,
      '@typescript-eslint/brace-style': 0,
      '@typescript-eslint/comma-dangle': 0,
      '@typescript-eslint/comma-spacing': 0,
      '@typescript-eslint/func-call-spacing': 0,
      '@typescript-eslint/indent': 0,
      '@typescript-eslint/keyword-spacing': 0,
      '@typescript-eslint/no-extra-semi': 0,
      '@typescript-eslint/space-before-blocks': 0,
      '@typescript-eslint/quotes': 0,
      '@typescript-eslint/semi': 0,
      '@typescript-eslint/space-before-function-paren': 0,
      '@typescript-eslint/space-infix-ops': 0,
      '@typescript-eslint/object-curly-spacing': 0,
      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     $schema: 'http://json.schemastore.org/prettierrc',
      //     arrowParens: 'avoid',
      //     bracketSpacing: true,
      //     printWidth: 100,
      //     proseWrap: 'always',
      //     quoteProps: 'as-needed',
      //     semi: true,
      //     singleQuote: true,
      //     tabWidth: 2,
      //     trailingComma: 'none',
      //     useTabs: false,
      //     endOfLine: 'auto'
      //   }
      // ],

      '@angular-eslint/no-output-on-prefix': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-inject': 'off',
      'class-methods-use-this': 'off',

      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore'
        }
      ],

      'no-magic-numbers': 'off',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        }
      ],

      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/dot-notation': 'off',
      'no-restricted-globals': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-param-reassign': 'off',
      'max-classes-per-file': 'off',
      radix: ['warn', 'as-needed'],
      'no-prototype-builtins': 'off',
      'no-return-assign': 'off',
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],

      'no-console': 'off',

      'no-empty': [
        'error',
        {
          allowEmptyCatch: true
        }
      ],

      '@typescript-eslint/return-await': 'off',
      // 'angular-rubic/explicit-function-return-type': 2,
      'no-continue': 'off',

      'rxjs-x/finnish': [
        'error',
        {
          functions: false,
          methods: false,

          names: {
            '^(canActivate|canActivateChild|canDeactivate|canLoad|intercept|resolve|validate)$': false
          },

          parameters: true,
          properties: true,
          strict: false,

          types: {
            '^EventEmitter$': false,
            '^TuiDialogService$': false
          },

          variables: true
        }
      ],

      'rxjs-x/no-exposed-subjects': [
        'error',
        {
          allowProtected: true
        }
      ],

      'rxjs-x/no-implicit-any-catch': 'off',
      'rxjs-x/no-ignored-takewhile-value': 'off',
      'rxjs-x/no-sharereplay': 'off',
      'rxjs-x/prefer-root-operators': 'off'
    }
  },
  {
    files: ['**/*.component.html'],

    extends: compat.extends(
      'plugin:@angular-eslint/template/recommended'
      // 'plugin:prettier/recommended'
    ),

    rules: {
      'max-len': [
        'warn',
        {
          code: 200
        }
      ]
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     $schema: 'http://json.schemastore.org/prettierrc',
      //     arrowParens: 'avoid',
      //     bracketSpacing: true,
      //     printWidth: 100,
      //     proseWrap: 'always',
      //     quoteProps: 'as-needed',
      //     semi: true,
      //     singleQuote: true,
      //     tabWidth: 2,
      //     trailingComma: 'none',
      //     useTabs: false,
      //     endOfLine: 'auto'
      //   }
      // ]
    }
  },
  {
    files: ['**/*.component.ts'],
    extends: compat.extends('plugin:@angular-eslint/template/process-inline-templates')
  },
  {
    files: ['src/**/*.spec.ts', 'src/**/*.d.ts'],

    languageOptions: {
      parserOptions: {
        project: './src/tsconfig.spec.json'
      }
    },

    extends: compat.extends('plugin:jasmine/recommended'),

    plugins: {
      jasmine: fixupPluginRules(jasmine)
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['src/app/features/trade/constants/bridge-providers.ts'],

    plugins: {
      'sort-keys-fix': fixupPluginRules(sortKeysFix)
    },

    rules: {
      'sort-keys-fix/sort-keys-fix': 'error'
    }
  }
]);
