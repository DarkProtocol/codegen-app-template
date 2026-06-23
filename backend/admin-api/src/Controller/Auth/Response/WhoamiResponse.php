<?php

declare(strict_types=1);

namespace AdminApi\Controller\Auth\Response;

use Common\App\Models\AdminUser;

final class WhoamiResponse
{
    public function __construct(
        public AccountResponse $account,
        public array $can,
    ) {}

    public static function fromModel(AdminUser $model, array $can): self
    {
        return new self(
            account: AccountResponse::fromModel($model),
            can: $can,
        );
    }
}
