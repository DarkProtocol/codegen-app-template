<?php

declare(strict_types=1);

namespace Common\Infra\ObjectStorage;

use Common\Infra\Config\Config;
use Common\Infra\ObjectStorage\Exception\ObjectStorageException;

final readonly class ObjectStorageFactory
{
    private const PROVIDER_NOP = 'nop';
    private const PROVIDER_FILE = 'file';

    public function __construct(
        private Config $config,
    ) {}

    public function create(): ObjectStorageInterface
    {
        $provider = $this->config->string('OBJECT_STORAGE_PROVIDER', self::PROVIDER_NOP);

        return match ($provider) {
            self::PROVIDER_NOP => new NopObjectStorage(),
            self::PROVIDER_FILE => new FileObjectStorage(
                $this->config->mustString('OBJECT_STORAGE_ROOT_PATH'),
            ),
            default => throw new ObjectStorageException(sprintf('Object storage provider "%s" is not supported.', $provider)),
        };
    }
}
