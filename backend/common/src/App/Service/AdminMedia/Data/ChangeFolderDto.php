<?php

declare(strict_types=1);

namespace Common\App\Service\AdminMedia\Data;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;

final readonly class ChangeFolderDto
{
    public function __construct(
        public Uuid $id,
        public Text $name,
    ) {}
}
