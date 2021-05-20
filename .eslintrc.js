module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        indent: ['error', 4],
        'no-console': 'off',
        'no-param-reassign': 'off',
        'no-prototype-builtins': 'off',
        'no-restricted-syntax': 'off',
        'guard-for-in': 'off',
    },
};
