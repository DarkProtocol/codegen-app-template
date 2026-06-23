<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\App\Models\AdminMediaFolder;

final readonly class FolderWithCountersDto
{
    public function __construct(
        public AdminMediaFolder $folder,
        public int $foldersCount,
        public int $filesCount,
    ) {}
}
