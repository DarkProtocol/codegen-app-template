<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

final class AdminMediaFolderContentResponse
{
    /**
     * @param AdminMediaFolderParentResponse[] $parents
     * @param AdminMediaFolderResponse[] $folders
     * @param AdminMediaFileResponse[] $files
     */
    public function __construct(
        public ?AdminMediaCurrentFolderResponse $currentFolder,
        public array $parents,
        public array $folders,
        public array $files,
    ) {}
}
