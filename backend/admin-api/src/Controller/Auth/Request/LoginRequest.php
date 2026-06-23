<?php

declare(strict_types=1);

namespace AdminApi\Controller\Auth\Request;

use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\Email;
use SensitiveParameter;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class LoginRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[ValueObject(Email::class)]
        private readonly mixed $email = null,
        #[Required]
        #[SensitiveParameter]
        private readonly mixed $password = null,
    ) {}

    public function email(): Email
    {
        return new Email((string) $this->email, field: 'email');
    }

    public function password(): string
    {
        return (string) $this->password;
    }
}
