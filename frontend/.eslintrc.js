module.exports = {
  extends: ['react-app'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: [],
  overrides: [
    {
      files: [
        'cypress/**/*.js',
        'cypress/**/*.jsx',
        '**/*.cy.js',
        '**/*.cy.jsx',
      ],
      env: {
        'cypress/globals': true,
      },
      plugins: ['cypress'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  rules: {
    // Disable all linting rules to prevent build failures
    indent: 'off',
    'no-trailing-spaces': 'off',
    'comma-dangle': 'off',
    'eol-last': 'off',
    'no-unused-vars': 'off',
  },
};
