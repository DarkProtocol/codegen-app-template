<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

use Common\App\Models\AdminMediaFolder;

final class AdminMediaFolderParentResponse
{
    public function __construct(
        public string $id,
        public ?string $parentId,
        public string $name,
    ) {}

    public static function fromModel(AdminMediaFolder $model): self
    {
        return new self(
            id: $model->getId()->value(),
            parentId: $model->getParentId()?->value(),
            name: $model->getName()->value(),
        );
    }
}
