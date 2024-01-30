module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@typescript-eslint', 'vue', '@tanstack/query'],
  extends: [
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
    'plugin:storybook/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.vue'],
      rules: {
        // eslint
        'no-magic-numbers': 'warn',
        'require-await': 'error',
        'no-shadow': 'off', // using ts one
        'no-unused-vars': 'off', // using ts one
        // typescript
        '@typescript-eslint/no-shadow': [
          'error',
          {
            ignoreTypeValueShadow: false,
            ignoreFunctionTypeParameterNameValueShadow: false,
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/consistent-type-imports': ['error'],
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': [
          'error',
          {
            typesToIgnore: ['MessageKey', 'MessageKey[]'],
          },
        ],
        '@typescript-eslint/await-thenable': 'error',
        // vue
        'vue/padding-line-between-blocks': ['error', 'always'],
        'vue/component-tags-order': [
          'error',
          {
            order: ['script', 'template', 'style'],
          },
        ],
        'vue/component-api-style': [
          'error',
          ['script-setup'], // "script-setup", "composition", "composition-vue2", or "options"
        ],
        'vue/component-name-in-template-casing': [
          'error',
          'PascalCase',
          {
            registeredComponentsOnly: false,
          },
        ],
        'vue/no-setup-props-destructure': 1, // TODO: remove once RFC reactive props destructure lands.
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@nx/typescript'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
  ],
}
