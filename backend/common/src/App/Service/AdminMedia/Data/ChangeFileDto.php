<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;

final readonly class ChangeFileDto
{
    public function __construct(
        public Uuid $id,
        public ?Uuid $folderId,
        public Text $name,
        public bool $isPublic,
    ) {}
}
