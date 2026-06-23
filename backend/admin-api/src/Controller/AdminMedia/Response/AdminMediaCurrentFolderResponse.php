<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

use Common\App\Models\AdminMediaFolder;
use DateTimeInterface;

final class AdminMediaCurrentFolderResponse
{
    public function __construct(
        public string $id,
        public ?string $parentId,
        public string $name,
        public ?string $createdBy,
        public string $createdAt,
        public string $updatedAt,
    ) {}

    public static function fromModel(AdminMediaFolder $model): self
    {
        return new self(
            id: $model->getId()->value(),
            parentId: $model->getParentId()?->value(),
            name: $model->getName()->value(),
            createdBy: $model->getCreatedBy()?->value(),
            createdAt: $model->getCreatedAt()->format(DateTimeInterface::ATOM),
            updatedAt: $model->getUpdatedAt()->format(DateTimeInterface::ATOM),
        );
    }
}
