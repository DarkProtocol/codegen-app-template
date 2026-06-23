<?php

declare(strict_types=1);

namespace AdminApi\Controller\Account\Request;

use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class ChangeAccountRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[StringValue]
        private readonly mixed $firstName = null,
        #[StringValue(skipOnEmpty: true)]
        private readonly mixed $lastName = null,
    ) {}

    public function firstName(): Text
    {
        return new Text((string) $this->firstName, field: 'firstName');
    }

    public function lastName(): NullableText
    {
        return new NullableText($this->lastName === null ? null : (string) $this->lastName);
    }
}
