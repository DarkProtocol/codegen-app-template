<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\App\Models\AdminMediaFile;
use Common\App\Models\AdminMediaFolder;

final readonly class FolderContentDto
{
    /**
     * @param AdminMediaFolder[] $parents
     * @param FolderWithCountersDto[] $folders
     * @param AdminMediaFile[] $files
     */
    public function __construct(
        public ?AdminMediaFolder $currentFolder,
        public array $parents,
        public array $folders,
        public array $files,
    ) {}
}
