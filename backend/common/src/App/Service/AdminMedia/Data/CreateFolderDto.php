<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;

final readonly class CreateFolderDto
{
    public function __construct(
        public ?Uuid $parentId,
        public Text $name,
        public Uuid $createdBy,
    ) {}
}
