module.exports = {
    configs: {
        recommended: {
            rules: {
                'custom-rules/modules-imports': [
                    'error',
                    {
                        srcPath: 'src',
                        modulesPath: 'modules',
                        modulesAlias: '@modules',
                        exceptModules: ['shared'],
                    },
                ],
            },
        },
    },
    rules: {
        'modules-imports': require('./rules/modules-imports'),
    },
}
