<?php

declare(strict_types=1);

namespace Common\Infra\ObjectStorage;

use Common\Shared\Exception\UnsupportedException;

final readonly class NopObjectStorage implements ObjectStorageInterface
{
    public function put(string $key, $stream): never
    {
        throw new UnsupportedException('Object storage is not configured.');
    }

    public function get(string $key): never
    {
        throw new UnsupportedException('Object storage is not configured.');
    }

    public function exists(string $key): never
    {
        throw new UnsupportedException('Object storage is not configured.');
    }

    public function delete(string $key): never
    {
        throw new UnsupportedException('Object storage is not configured.');
    }
}
