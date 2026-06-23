<?php

declare(strict_types=1);

namespace AdminApi\Controller\Auth\Response;

use Common\App\Models\AdminUser;

final class AccountResponse
{
    public function __construct(
        public string $id,
        public string $email,
        public string $firstName,
        public ?string $lastName,
        public string $role,
    ) {}

    public static function fromModel(AdminUser $model): self
    {
        return new self(
            id: $model->getId()->value(),
            email: $model->getEmail()->value(),
            firstName: $model->getFirstName()->value(),
            lastName: $model->getLastName()->value(),
            role: $model->getRole()->value,
        );
    }
}
