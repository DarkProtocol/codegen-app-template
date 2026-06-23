<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

use Common\App\Models\AdminMediaFolder;
use Common\App\Service\AdminMedia\Data\FolderWithCountersDto;
use DateTimeInterface;

final class AdminMediaFolderResponse
{
    public function __construct(
        public string $id,
        public ?string $parentId,
        public string $name,
        public ?string $createdBy,
        public string $createdAt,
        public string $updatedAt,
        public int $foldersCount,
        public int $filesCount,
    ) {}

    public static function fromModel(
        AdminMediaFolder $model,
        int $foldersCount = 0,
        int $filesCount = 0,
    ): self
    {
        return new self(
            id: $model->getId()->value(),
            parentId: $model->getParentId()?->value(),
            name: $model->getName()->value(),
            createdBy: $model->getCreatedBy()?->value(),
            createdAt: $model->getCreatedAt()->format(DateTimeInterface::ATOM),
            updatedAt: $model->getUpdatedAt()->format(DateTimeInterface::ATOM),
            foldersCount: $foldersCount,
            filesCount: $filesCount,
        );
    }

    public static function fromFolderWithCounters(FolderWithCountersDto $dto): self
    {
        return self::fromModel(
            model: $dto->folder,
            foldersCount: $dto->foldersCount,
            filesCount: $dto->filesCount,
        );
    }
}
