/*eslint-env node*/
/*eslint quote-props: [2, "always"] */

// eslint-disable-next-line strict
'use strict';

const path = require('path');

const JS_EXTENSION = ['.mjs', '.js', '.jsx'];
const TS_EXTENSION = ['.ts', '.tsx', '.d.ts'];
const ALL_EXTENSION = [...TS_EXTENSION, ...JS_EXTENSION];

// ESLint Configuration Files enables to include comments.
// https://eslint.org/docs/configuring/#comments-in-configuration-files
module.exports = {
    'extends': [
        'eslint-config-abema/config/eslintrc_react_hooks.js',
    ],

    'parserOptions': {
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true
        },
    },

    'env': {
        'browser': true,
        'webextensions': true,
    },

    'settings': {
        'import/resolver': {
            'node': {
                'extensions': ALL_EXTENSION,
            },
        },
    },

    'overrides': [
        {
            'files': ['*.ts', '*.tsx', '*.d.ts'],

            'extends': [
                'eslint-config-abema/config/eslintrc_typescript.js',
                'eslint-config-abema/config/eslintrc_typescript_react.js',
            ],

            'parserOptions': {
                'sourceType': 'module',
                'ecmaFeatures': {
                    'jsx': true
                },
                'project': path.resolve(__dirname, '../tsconfig.eslint.json'),
                'extraFileExtensions': ['.cjs'],
            },

            'globals': {
                // see https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
                'JSX': 'readonly',
            },

            'rules': {
                // FIXME: Re-enable for the future.
                '@typescript-eslint/member-ordering': 'off',
            },
        },
    ],
};
