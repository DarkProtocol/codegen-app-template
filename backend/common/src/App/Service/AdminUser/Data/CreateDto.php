<?php

declare(strict_types=1);

namespace Common\App\Service\AdminUser\Data;

use Common\App\Models\Enum\AdminUserRole;
use Common\Shared\ValueObject\Email;
use Common\Shared\ValueObject\NewPassword;
use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;

final readonly class CreateDto
{
    public function __construct(
        public Email $email,
        public Text $firstName,
        public NullableText $lastName,
        public NewPassword $password,
        public AdminUserRole $role,
    ) {}
}
