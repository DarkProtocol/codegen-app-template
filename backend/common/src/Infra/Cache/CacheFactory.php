<?php

declare(strict_types=1);

namespace Common\Infra\Cache;

use Common\Infra\Config\Config;
use Predis\Client;
use Psr\SimpleCache\CacheInterface as PsrCacheInterface;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface;
use Yiisoft\Cache\Redis\RedisCache;

final readonly class CacheFactory
{
    public function __construct(
        private Config $config,
    ) {}

    public function create(): CacheInterface
    {
        return new Cache($this->createPsr());
    }

    public function createPsr(): PsrCacheInterface
    {
        return new RedisCache(
            new Client([
                'host' => $this->config->mustString('REDIS_HOST'),
                'port' => $this->config->mustString('REDIS_PORT'),
                'password' => $this->config->mustString('REDIS_PASSWORD'),
                'database' => (int) $this->config->string('REDIS_DATABASE', '0'),
            ]),
        );
    }
}
