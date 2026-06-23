<?php

declare(strict_types=1);

namespace Common\Shared\Exception;

use LogicException;

final class MustException extends LogicException
{
    public function __construct(string $propertyName)
    {
        parent::__construct('Undefined property ' . $propertyName);
    }
}
