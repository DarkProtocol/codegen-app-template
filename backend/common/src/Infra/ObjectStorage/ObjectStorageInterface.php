<?php

declare(strict_types=1);

namespace Common\Infra\ObjectStorage;

interface ObjectStorageInterface
{
    /**
     * @param resource $stream
     */
    public function put(string $key, $stream): void;

    /**
     * @return resource
     */
    public function get(string $key);

    public function exists(string $key): bool;

    public function delete(string $key): void;
}
