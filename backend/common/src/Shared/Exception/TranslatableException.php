<?php

declare(strict_types=1);

namespace Common\Shared\Exception;

interface TranslatableException
{
    public function messageKey(): string;

    /**
     * @return array<string, scalar|null>
     */
    public function messageParams(): array;
}
