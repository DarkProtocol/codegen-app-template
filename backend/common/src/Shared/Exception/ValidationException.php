<?php

declare(strict_types=1);

namespace Common\Shared\Exception;

use DomainException;

final class ValidationException extends DomainException implements TranslatableException
{
    /**
     * @param array<string, scalar|null> $messageParams
     */
    public function __construct(
        private readonly string $messageKey,
        private readonly array $messageParams = [],
        private readonly ?string $field = null,
    ) {
        parent::__construct($messageKey);
    }

    public function messageKey(): string
    {
        return $this->messageKey;
    }

    public function messageParams(): array
    {
        return $this->messageParams;
    }

    public function field(): ?string
    {
        return $this->field;
    }
}
