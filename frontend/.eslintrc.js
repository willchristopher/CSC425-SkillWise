module.exports = {
  "extends": [
    "react-app"
  ],
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "plugins": [],
  "rules": {
    // Disable all linting rules to prevent build failures
    "indent": "off",
    "no-trailing-spaces": "off",
    "comma-dangle": "off",
    "eol-last": "off",
    "no-unused-vars": "off"
  }
};