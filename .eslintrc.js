module.exports = {
  root: true,
  overrides: [
    {
      files: ['*.ts'],
      plugins: ['import', 'unused-imports', 'angular-rubic', 'rxjs', 'rxjs-angular'],
      parserOptions: {
        project: ['tsconfig.*?.json', 'e2e/tsconfig.e2e.json'],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true
      },
      extends: [
        'plugin:@angular-eslint/recommended',
        'airbnb-typescript/base',
        'plugin:prettier/recommended',
        'plugin:rxjs/recommended'
      ],
      rules: {
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        'no-plusplus': 'off',
        'class-method-use-this': 'off',
        'no-underscore-dangle': 'off',
        'no-inferrable-types': 'off',
        '@typescript-eslint/no-explicit-any': 2,
        '@typescript-eslint/no-unused-vars': 'off',
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
        '@angular-eslint/no-output-on-prefix': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@angular-eslint/no-input-rename': 'off',
        'class-methods-use-this': 'off',
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'no-magic-numbers': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'enumMember',
            format: ['UPPER_CASE']
          }
        ],
        // Styling.
        'array-bracket-spacing': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        // Temporary rules. Remove after full refactoring.
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/dot-notation': 'off',
        'no-restricted-globals': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'no-param-reassign': 'off',
        // Temporary rules. Remove as fast as it can be.
        'max-classes-per-file': 'off',
        radix: ['warn', 'as-needed'],
        'no-prototype-builtins': 'off',
        'no-return-assign': 'off',
        'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
        'no-console': [
          'warn',
          {
            allow: ['debug', 'error', 'info', 'warn']
          }
        ],
        'no-empty': ['error', { allowEmptyCatch: true }],
        '@typescript-eslint/return-await': 'off',
        'angular-rubic/explicit-function-return-type': 2,
        'no-continue': 'off',
        /* RxJs */
        'rxjs/finnish': [
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
        'rxjs/no-exposed-subjects': ['error', { allowProtected: true }],
        'rxjs-angular/prefer-async-pipe': 'warn',
        'rxjs-angular/prefer-takeuntil': [
          'warn',
          {
            checkComplete: false,
            checkDecorators: ['Component'],
            checkDestroy: false
          }
        ],
        'rxjs/no-implicit-any-catch': 'off',
        'rxjs/no-ignored-takewhile-value': 'off',
        'rxjs/no-sharereplay': 'off'
      }
    },
    {
      files: ['*.component.html'],
      extends: ['plugin:@angular-eslint/template/recommended', 'plugin:prettier/recommended'],
      rules: {
        'max-len': ['warn', { code: 200 }]
      }
    },
    {
      files: ['*.component.ts'],
      extends: ['plugin:@angular-eslint/template/process-inline-templates']
    },
    {
      files: ['src/**/*.spec.ts', 'src/**/*.d.ts'],
      parserOptions: {
        project: './src/tsconfig.spec.json'
      },
      extends: ['plugin:jasmine/recommended'],
      plugins: ['jasmine'],
      env: { jasmine: true },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      files: ['src/app/features/trade/constants/bridge-providers.ts'],
      plugins: ['sort-keys-fix'],
      rules: {
        'sort-keys-fix/sort-keys-fix': 'error'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    es6: true
  }
};
