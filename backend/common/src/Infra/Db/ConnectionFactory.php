<?php

declare(strict_types=1);

namespace Common\Infra\Db;

use Common\Infra\Config\Config;
use Yiisoft\Db\Cache\SchemaCache;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Pgsql\Connection;
use Yiisoft\Db\Pgsql\Driver;
use Yiisoft\Db\Pgsql\Dsn;

final readonly class ConnectionFactory
{
    public function __construct(
        private SchemaCache $schemaCache,
        private Config $config,
    ) {}

    public function create(): ConnectionInterface
    {
        $driver = new Driver(
            new Dsn(
                host: $this->config->mustString('DB_HOST'),
                databaseName: $this->config->mustString('DB_NAME'),
                port: $this->config->mustString('DB_PORT'),
            ),
            $this->config->mustString('DB_USER'),
            $this->config->mustString('DB_PASSWORD'),
        );
        $driver->charset('utf8');

        return new Connection($driver, $this->schemaCache);
    }
}
