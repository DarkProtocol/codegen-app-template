<?php

declare(strict_types=1);

namespace Common\App\Service\AdminUser\Data;

use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;

final readonly class ChangeAccountDto
{
    public function __construct(
        public Text $firstName,
        public NullableText $lastName,
    ) {}
}
