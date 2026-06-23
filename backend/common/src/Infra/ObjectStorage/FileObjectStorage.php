<?php

declare(strict_types=1);

namespace Common\Infra\ObjectStorage;

use Common\Infra\ObjectStorage\Exception\InvalidObjectKeyException;
use Common\Infra\ObjectStorage\Exception\ObjectNotFoundException;
use Common\Infra\ObjectStorage\Exception\ObjectStorageException;

final readonly class FileObjectStorage implements ObjectStorageInterface
{
    public function __construct(
        private string $rootPath,
    ) {
        if ($this->rootPath === '') {
            throw new ObjectStorageException('Object storage root path must not be empty.');
        }

        if (!is_dir($this->rootPath)) {
            throw new ObjectStorageException(sprintf('Object storage root path "%s" must be a directory.', $this->rootPath));
        }

        if (!is_readable($this->rootPath)) {
            throw new ObjectStorageException(sprintf('Object storage root path "%s" must be readable.', $this->rootPath));
        }

        if (!is_writable($this->rootPath)) {
            throw new ObjectStorageException(sprintf('Object storage root path "%s" must be writable.', $this->rootPath));
        }
    }

    public function put(string $key, $stream): void
    {
        if (!is_resource($stream)) {
            throw new ObjectStorageException('Object content must be a readable stream resource.');
        }

        $path = $this->path($key);
        $directory = dirname($path);

        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new ObjectStorageException(sprintf('Unable to create object storage directory "%s".', $directory));
        }

        $target = fopen($path, 'wb');

        if ($target === false) {
            throw new ObjectStorageException(sprintf('Unable to open object "%s" for writing.', $key));
        }

        try {
            if (stream_copy_to_stream($stream, $target) === false) {
                throw new ObjectStorageException(sprintf('Unable to write object "%s".', $key));
            }
        } finally {
            fclose($target);
        }
    }

    public function get(string $key)
    {
        $path = $this->path($key);

        if (!is_file($path)) {
            throw new ObjectNotFoundException(sprintf('Object "%s" not found.', $key));
        }

        $stream = fopen($path, 'rb');

        if ($stream === false) {
            throw new ObjectStorageException(sprintf('Unable to open object "%s" for reading.', $key));
        }

        return $stream;
    }

    public function exists(string $key): bool
    {
        return is_file($this->path($key));
    }

    public function delete(string $key): void
    {
        $path = $this->path($key);

        if (!is_file($path)) {
            return;
        }

        if (!unlink($path)) {
            throw new ObjectStorageException(sprintf('Unable to delete object "%s".', $key));
        }
    }

    private function path(string $key): string
    {
        $this->assertValidKey($key);

        return rtrim($this->rootPath, '/') . '/' . $key;
    }

    private function assertValidKey(string $key): void
    {
        if ($key === '') {
            throw new InvalidObjectKeyException('Object key must not be empty.');
        }

        if ($key[0] === '/' || str_contains($key, '\\') || str_contains($key, "\0")) {
            throw new InvalidObjectKeyException(sprintf('Object key "%s" is invalid.', $key));
        }

        foreach (explode('/', $key) as $segment) {
            if ($segment === '..') {
                throw new InvalidObjectKeyException(sprintf('Object key "%s" must not contain path traversal.', $key));
            }
        }
    }
}
