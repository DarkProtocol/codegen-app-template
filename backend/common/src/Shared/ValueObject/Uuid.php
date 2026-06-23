<?php

declare(strict_types=1);

namespace Common\Shared\ValueObject;

use Common\Shared\Exception\ValidationException;
use Common\Shared\Util\Uuid as UuidUtil;

final readonly class Uuid
{
    private string $value;

    public function __construct(string $value, ?string $field = null)
    {
        $value = trim(mb_strtolower($value));

        if (!UuidUtil::isValid($value)) {
            throw new ValidationException('validation.uuid.invalid', field: $field);
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(Uuid $compare): bool
    {
        return $this->value() === $compare->value();
    }
}
