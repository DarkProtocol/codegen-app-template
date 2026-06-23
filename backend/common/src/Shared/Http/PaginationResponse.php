<?php

declare(strict_types=1);

namespace Common\Shared\Http;

final readonly class PaginationResponse {
    public function __construct(
        public array $data,
        public int $count,
        public int $currentPage,
        public int $perPage,
        public int $pages,
    ) {}

    public static function fromPagination(array $data, int $count, PaginationRequest $pagination): self
    {
        return new self(
            data: $data,
            count: $count,
            currentPage: $pagination->page,
            perPage: $pagination->perPage,
            pages: (int) ceil($count / $pagination->perPage),
        );
    }
}
