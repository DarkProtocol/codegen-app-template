<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers\Request;

use Common\App\Models\Enum\AdminUserRole;
use Common\Shared\Exception\ValidationException;
use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\Email;
use Common\Shared\ValueObject\NewPassword;
use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;
use SensitiveParameter;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class CreateRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[ValueObject(Email::class)]
        private readonly mixed $email = null,
        #[Required]
        #[StringValue]
        private readonly mixed $firstName = null,
        #[StringValue(skipOnEmpty: true)]
        private readonly mixed $lastName = null,
        #[Required]
        #[ValueObject(NewPassword::class)]
        #[SensitiveParameter]
        private readonly mixed $password = null,
        #[Required]
        #[StringValue]
        private readonly mixed $role = null,
    ) {}

    public function password(): NewPassword
    {
        return new NewPassword((string) $this->password, field: 'password');
    }

    public function email(): Email
    {
        return new Email((string) $this->email, field: 'email');
    }

    public function firstName(): Text
    {
        return new Text((string) $this->firstName, field: 'firstName');
    }

    public function lastName(): NullableText
    {
        return new NullableText($this->lastName === null ? null : (string) $this->lastName);
    }

    public function role(): AdminUserRole
    {
        $role = AdminUserRole::tryFrom((string) $this->role);
        if ($role === null) {
            throw new ValidationException(messageKey: 'validation.value.not_in', field: 'role');
        }

        return $role;
    }
}
