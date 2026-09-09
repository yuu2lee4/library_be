export default [
    {
        ignores: [
            'node_modules/**',
            'upload/**',
            'coverage/**'
        ]
    },
    {
        files: ['**/*.js', '**/*.cjs'],
        languageOptions: {
            globals: {
                console: 'readonly',
                fetch: 'readonly',
                process: 'readonly',
                require: 'readonly',
                module: 'readonly'
            }
        },
        rules: {
            'no-constant-binary-expression': 'error',
            'no-constant-condition': 'error',
            'no-duplicate-imports': 'error',
            'no-self-compare': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': ['warn', { args: 'none' }],
            'no-undef': 'error'
        }
    }
];