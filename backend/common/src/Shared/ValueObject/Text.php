<?php

declare(strict_types=1);

namespace Common\Shared\ValueObject;

use Common\Shared\Exception\ValidationException;

final readonly class Text
{
    private string $value;

    public function __construct(string $value, ?string $field = null)
    {
        $value = trim($value);
        if ($value === '') {
            throw new ValidationException(messageKey: 'validation.not_empty', field: $field);
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
