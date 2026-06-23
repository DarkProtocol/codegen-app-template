<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'newMigrationNamespace' => 'Common\\Infra\\Db\\Migration',
        'newMigrationPath' => '',
        'sourceNamespaces' => [
            'Common\\Infra\\Db\\Migration',
        ],
        'sourcePaths' => [],
    ],
    'yiisoft/yii-console' => [
        'serve' => [
            'appRootPath' => null,
            'options' => [
                'address' => '127.0.0.1',
                'port' => '8080',
                'docroot' => 'admin-api/web',
                'router' => 'admin-api/web/index.php',
            ],
        ],
        'commands' => require __DIR__ . '/commands.php',
    ],
];
