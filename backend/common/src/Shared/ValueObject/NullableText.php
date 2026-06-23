<?php

declare(strict_types=1);

namespace Common\Shared\ValueObject;

final readonly class NullableText
{
    private ?string $value;

    public function __construct(?string $value)
    {
        if ($value === null) {
            $this->value = null;
            return;
        }

        $value = trim($value);
        $this->value = $value === '' ? null : $value;
    }

    public function value(): ?string
    {
        return $this->value;
    }
}
