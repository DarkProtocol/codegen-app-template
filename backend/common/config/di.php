<?php

declare(strict_types=1);

use Common\Infra\Cache\CacheFactory;
use Common\Infra\Config\Config;
use Common\Infra\Db\ConnectionFactory;
use Common\Infra\ObjectStorage\ObjectStorageFactory;
use Common\Infra\ObjectStorage\ObjectStorageInterface;
use Psr\SimpleCache\CacheInterface as PsrCacheInterface;
use Psr\Log\LoggerInterface;
use Yiisoft\Cache\CacheInterface;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\Definitions\ReferencesArray;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;

/** @var array $params */

return [
    Config::class => Config::class,

    LoggerInterface::class => [
        'class' => Logger::class,
        '__construct()' => [
            'targets' => ReferencesArray::from([
                StreamTarget::class,
            ]),
        ],
    ],

    ConnectionInterface::class => DynamicReference::to(
        static fn(ConnectionFactory $factory): ConnectionInterface => $factory->create(),
    ),

    CacheInterface::class => DynamicReference::to(
        static fn(CacheFactory $factory): CacheInterface => $factory->create(),
    ),
    PsrCacheInterface::class => DynamicReference::to(
        static fn(CacheFactory $factory): PsrCacheInterface => $factory->createPsr(),
    ),

    ObjectStorageInterface::class => DynamicReference::to(
        static fn(ObjectStorageFactory $factory): ObjectStorageInterface => $factory->create(),
    ),
];
