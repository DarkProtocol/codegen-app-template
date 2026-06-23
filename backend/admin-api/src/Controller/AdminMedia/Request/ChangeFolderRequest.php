<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Request;

use Common\Shared\Http\Rule\Length;
use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\ValueObject\Text;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class ChangeFolderRequest extends AbstractInput
{
    public function __construct(
        #[Required]
        #[StringValue]
        #[Length(max: 100)]
        private readonly mixed $name = null,
    ) {}

    public function name(): Text
    {
        return new Text((string) $this->name, field: 'name');
    }
}
