<?php

declare(strict_types=1);

namespace AdminApi\Controller\Account\Request;

use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\NewPassword;
use SensitiveParameter;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class ChangePasswordRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[StringValue]
        #[SensitiveParameter]
        private readonly mixed $currentPassword = null,
        #[Required]
        #[ValueObject(NewPassword::class)]
        #[SensitiveParameter]
        private readonly mixed $password = null,
    ) {}

    public function currentPassword(): string
    {
        return (string) $this->currentPassword;
    }

    public function password(): NewPassword
    {
        return new NewPassword((string) $this->password, field: 'password');
    }
}
