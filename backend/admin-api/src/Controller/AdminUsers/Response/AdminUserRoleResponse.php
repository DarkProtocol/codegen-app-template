<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers\Response;

use Common\App\Models\Enum\AdminUserRole;

final readonly class AdminUserRoleResponse
{
    public function __construct(
        public string $value,
        public string $label,
    ) {}

    public static function fromEnum(AdminUserRole $role): self
    {
        return new self(
            value: $role->value,
            label: ucfirst($role->value),
        );
    }
}
