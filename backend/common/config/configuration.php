<?php

declare(strict_types=1);

// NOTE: After making changes in this file, run `composer yii-config-rebuild` to update the merge plan.
return [
    'config-plugin' => [
        'params' => 'params.php',
        'params-web' => [
            '$params',
            '../../admin-api/config/params.php',
        ],
        'params-console' => [
            '$params',
            '../../console/config/params.php',
        ],
        'di' => 'di.php',
        'di-web' => [
            '$di',
            '../../admin-api/config/di.php',
        ],
        'di-console' => '$di',
        'di-delegates' => [],
        'di-delegates-console' => '$di-delegates',
        'di-delegates-web' => '$di-delegates',
        'di-providers' => [],
        'di-providers-web' => '$di-providers',
        'di-providers-console' => '$di-providers',
        'events' => [],
        'events-web' => '$events',
        'events-console' => '$events',
        'routes' => [],
        'bootstrap' => 'bootstrap.php',
        'bootstrap-web' => '$bootstrap',
        'bootstrap-console' => '$bootstrap',
    ],
    'config-plugin-environments' => [
        'dev' => [
            'params' => 'environments/dev/params.php',
        ],
        'prod' => [
            'params' => 'environments/prod/params.php',
        ],
        'test' => [
            'params' => 'environments/test/params.php',
        ],
    ],
    'config-plugin-options' => [
        'source-directory' => 'common/config',
    ],
];
