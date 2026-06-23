<?php

declare(strict_types=1);

namespace Common\Shared\Util;

use Ramsey\Uuid\Uuid as UuidBase;
use Common\Shared\ValueObject\Uuid as UuidVO;

final readonly class Uuid
{
    /**
     * Generate a version 4 (random) UUID.
     */
    public function generate(): UuidVO
    {
        return new UuidVO(UuidBase::uuid4()->toString());
    }

    /**
     * Is string has valid uuid format.
     */
    public static function isValid(string $string): bool
    {
        return UuidBase::isValid($string);
    }
}
