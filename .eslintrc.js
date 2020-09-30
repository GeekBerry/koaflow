module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    BigInt: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'arrow-parens': 0,
    'func-names': 0, // for router
    'function-paren-newline': 0,
    'linebreak-style': 0, // for Windows
    'max-classes-per-file': 0,
    'max-len': 0, // for doc
    'no-restricted-syntax': 0, // async for loop
    'no-param-reassign': 0,
    'no-underscore-dangle': 0, // _xxx for protected
    'no-use-before-define': 0,
    'object-curly-newline': 0,
    'object-property-newline': 0, // for parameter
    'quote-props': 0,
  },
};
