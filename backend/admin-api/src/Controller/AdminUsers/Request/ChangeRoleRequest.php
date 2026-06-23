<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers\Request;

use Common\App\Models\Enum\AdminUserRole;
use Common\Shared\Exception\ValidationException;
use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class ChangeRoleRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[StringValue]
        private readonly mixed $role,
    ) {}

    public function role(): AdminUserRole
    {
        $role = AdminUserRole::tryFrom((string) $this->role);
        if ($role === null) {
            throw new ValidationException(messageKey: 'validation.value.not_in', field: 'role');
        }

        return $role;
    }
}
