<?php

declare(strict_types=1);

namespace Common\Shared\ValueObject;

use Common\Shared\Exception\ValidationException;

final readonly class Email
{
    private string $value;

    public function __construct(string $value, ?string $field = null)
    {
        $value = trim(mb_strtolower($value));

        if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new ValidationException('validation.email.invalid', field: $field);
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
