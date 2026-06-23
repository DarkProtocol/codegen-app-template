<?php

declare(strict_types=1);

namespace Common\App\Repository;

use Common\App\Models\AdminUser;
use Common\Shared\Http\PaginationRequest;
use Common\Shared\ValueObject\Uuid;
use Common\Shared\Util\Uuid as UuidUtil;
use Common\Shared\ValueObject\Email;
use DateTimeImmutable;

final readonly class AdminUserRepository
{
    public function __construct(
        private AdminUser $model,
        private UuidUtil $uuid,
    ) {}

    public function getEmptyModel(): AdminUser
    {
        return new AdminUser();
    }

    public function save(AdminUser $model): AdminUser
    {
        if ($model->isNew()) {
            $model->setId($this->uuid->generate());
            $model->setCreatedAt(new DateTimeImmutable());
        }

        $model->setUpdatedAt(new DateTimeImmutable());
        $model->save();
        $model->refresh();

        return $model;
    }

    public function getOneByEmail(Email $email): ?AdminUser
    {
        return $this->model->query()
            ->where([
                'email' => $email->value(),
            ])
            ->limit(1)
            ->one();
    }

    public function getOneById(Uuid $id): ?AdminUser
    {
        return $this->model->query()
            ->where([
                'id' => $id->value(),
            ])
            ->limit(1)
            ->one();
    }

    /**
     * @return AdminUser[]
     */
    public function getList(PaginationRequest $pagination): array
    {
        return $this->model->query()
            ->orderBy(['created_at' => \SORT_DESC])
            ->limit($pagination->limit())
            ->offset($pagination->offset())
            ->all();
    }

    public function count(): int
    {
        return (int) $this->model->query()->count();
    }
}
