<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Request;

use Common\Shared\Http\Rule\ValueObject;
use Common\Shared\ValueObject\Uuid;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromQuery;

#[FromQuery]
final class FolderListRequest extends AbstractInput
{
    public function __construct(
        #[ValueObject(Uuid::class)]
        private readonly mixed $parentId = null,
    ) {}

    public function parentId(): ?Uuid
    {
        return $this->parentId === null || $this->parentId === ''
            ? null
            : new Uuid((string) $this->parentId, field: 'parentId');
    }
}
