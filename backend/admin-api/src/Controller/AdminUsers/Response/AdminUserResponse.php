<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers\Response;

use Common\App\Models\AdminUser;
use DateTimeInterface;

final class AdminUserResponse
{
    public function __construct(
        public string $id,
        public string $email,
        public string $firstName,
        public ?string $lastName,
        public string $role,
        public string $createdAt,
        public string $updatedAt,
        public ?string $bannedAt,
    ) {}

    public static function fromModel(AdminUser $model): self
    {
        return new self(
            id: $model->getId()->value(),
            email: $model->getEmail()->value(),
            firstName: $model->getFirstName()->value(),
            lastName: $model->getLastName()->value(),
            role: $model->getRole()->value,
            createdAt: $model->getCreatedAt()->format(DateTimeInterface::ATOM),
            updatedAt: $model->getUpdatedAt()->format(DateTimeInterface::ATOM),
            bannedAt: $model->getBannedAt()?->format(DateTimeInterface::ATOM),
        );
    }
}
