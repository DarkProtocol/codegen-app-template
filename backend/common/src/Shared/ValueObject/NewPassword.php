<?php

declare(strict_types=1);

namespace Common\Shared\ValueObject;

use Common\Shared\Exception\ValidationException;

final readonly class NewPassword
{
    private string $value;

    public function __construct(string $value, ?string $field = null)
    {
        $minLength = 6;
        if (mb_strlen($value) < $minLength) {
            throw new ValidationException(
                messageKey: 'validation.password.too_short',
                messageParams: ['min' => $minLength],
                field: $field,
            );
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
