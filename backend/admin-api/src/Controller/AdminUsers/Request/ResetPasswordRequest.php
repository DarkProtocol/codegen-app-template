<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers\Request;

use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\NewPassword;
use SensitiveParameter;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class ResetPasswordRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[ValueObject(NewPassword::class)]
        #[SensitiveParameter]
        private readonly mixed $password = null,
    ) {}

    public function password(): NewPassword
    {
        return new NewPassword((string) $this->password, field: 'password');
    }
}
