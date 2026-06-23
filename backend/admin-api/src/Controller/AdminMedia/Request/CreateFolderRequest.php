<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Request;

use Common\Shared\Http\Rule\Length;
use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class CreateFolderRequest extends AbstractInput
{
    public function __construct(
        #[ValueObject(Uuid::class)]
        private readonly mixed $parentId = null,
        #[Required]
        #[StringValue]
        #[Length(max: 100)]
        private readonly mixed $name = null,
    ) {}

    public function parentId(): ?Uuid
    {
        return $this->parentId === null || $this->parentId === ''
            ? null
            : new Uuid((string) $this->parentId, field: 'parentId');
    }

    public function name(): Text
    {
        return new Text((string) $this->name, field: 'name');
    }
}
