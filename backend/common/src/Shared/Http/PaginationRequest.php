<?php

declare(strict_types=1);

namespace Common\Shared\Http;

use InvalidArgumentException;

final readonly class PaginationRequest {
    public function __construct(
        public int $page,
        public int $perPage,
    ) {
        if ($this->page < 1) {
            throw new InvalidArgumentException('Page must be greater than or equal to 1.');
        }

        if ($this->perPage < 1) {
            throw new InvalidArgumentException('Per page must be greater than or equal to 1.');
        }
    }

    public function limit(): int
    {
        return $this->perPage;
    }

    public function offset(): int
    {
        return ($this->page - 1) * $this->perPage;
    }
}
