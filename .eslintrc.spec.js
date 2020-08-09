const baseConfig = require('./.eslintrc');

module.exports = {
  ...baseConfig,
  parserOptions: {
    project: 'tsconfig.spec.json',
    sourceType: 'module',
  },
  rules: {
    ...baseConfig.rules,
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
};
