<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\App\Models\AdminMediaFolder;

final readonly class FolderTreeNodeDto
{
    /**
     * @param self[] $children
     */
    public function __construct(
        public AdminMediaFolder $folder,
        public array $children,
    ) {}
}
