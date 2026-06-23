<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Request;

use Common\Shared\Http\Rule\BooleanValue;
use Common\Shared\Http\Rule\Length;
use Common\Shared\Http\Rule\Required;
use Common\Shared\Http\Rule\StringValue;
use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;

#[FromBody]
final class CreateFileRequest extends AbstractInput
{
    public function __construct(
        #[ValueObject(Uuid::class)]
        private readonly mixed $folderId = null,
        #[Required]
        #[StringValue]
        #[Length(max: 100)]
        private readonly mixed $name = null,
        #[BooleanValue(skipOnEmpty: true)]
        private readonly mixed $isPublic = false,
    ) {}

    public function folderId(): ?Uuid
    {
        return $this->folderId === null ? null : new Uuid((string) $this->folderId, field: 'folderId');
    }

    public function name(): Text
    {
        return new Text((string) $this->name, field: 'name');
    }

    public function isPublic(): bool
    {
        return (bool) $this->isPublic;
    }
}
