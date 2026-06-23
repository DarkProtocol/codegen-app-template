<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use Common\Shared\Http\Upload\UploadedFile;

final readonly class CreateFileDto
{
    public function __construct(
        public ?Uuid $folderId,
        public Text $name,
        public UploadedFile $file,
        public bool $isPublic,
        public Uuid $createdBy,
    ) {}
}
