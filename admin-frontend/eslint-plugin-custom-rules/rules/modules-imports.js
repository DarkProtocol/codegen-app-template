const path = require('path');

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Restrict imports module components outside of index file',
            recommended: true,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    srcPath: {
                        type: 'string',
                    },
                    modulesPath: {
                        type: 'string',
                    },
                    modulesAlias: {
                        type: 'string',
                    },
                    exceptModules: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const { source } = node;

                if (!source || !source.value) {
                    return;
                }

                const { srcPath, modulesPath, modulesAlias, exceptModules } = context.options[0];
                const importPath = source.value;

                // Check for wrong alias usage like @/modules instead of @modules
                if (importPath.startsWith('@/modules/')) {
                    const correctImport = importPath.replace('@/modules/', modulesAlias + '/');
                    context.report({
                        node: node.source,
                        message: `Use '${modulesAlias}' alias instead of '@/modules'. Expected: '${correctImport}'`,
                    });
                    return;
                }

                if (!importPath.startsWith(modulesAlias)) {
                    return;
                }

                for (const exceptModule of exceptModules) {
                    if (importPath.startsWith(modulesAlias + '/' + exceptModule)) {
                        return;
                    }
                }

                // importPath @modules/moduleName/path/to/file
                const importParts = importPath.split('/');
                if (importParts.length < 3) {
                    return;
                }

                // modules/moduleName
                const importModulePath = modulesPath + '/' + importParts[1];
                const currentFilePath = path.normalize(context.filename);
                const cleanDir = currentFilePath.replace(path.normalize(process.cwd() + '/' + srcPath + '/'), '');

                if (cleanDir.startsWith(importModulePath)) {
                    // can use any declaration inside module
                    return;
                }

                if (importParts > 3 || importParts[2] !== 'index') {
                    context.report({
                        node: node.source,
                        message: `Use import from index file: '${modulesAlias + '/' + importParts[1] + '/index'}'`,
                    });
                }
            },
        };
    }
};
