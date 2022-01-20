module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
        browser: true,
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
        'no-shadow': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        'no-underscore-dangle': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['/tasks/**/*'] }],
    },
};
