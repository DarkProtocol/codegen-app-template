<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

use Common\App\Service\AdminMedia\Data\FolderTreeNodeDto;

final class AdminMediaFolderTreeNodeResponse
{
    /**
     * @param self[] $children
     */
    public function __construct(
        public string $id,
        public ?string $parentId,
        public string $name,
        public array $children,
    ) {}

    public static function fromDto(FolderTreeNodeDto $dto): self
    {
        return new self(
            id: $dto->folder->getId()->value(),
            parentId: $dto->folder->getParentId()?->value(),
            name: $dto->folder->getName()->value(),
            children: array_map(
                fn (FolderTreeNodeDto $child) => self::fromDto($child),
                $dto->children,
            ),
        );
    }
}
