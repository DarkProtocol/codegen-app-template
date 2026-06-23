<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

final class AdminMediaConfigResponse
{
    /**
     * @param string[] $supportedExtensions
     */
    public function __construct(
        public int $maxFileSize,
        public array $supportedExtensions,
    ) {}
}
