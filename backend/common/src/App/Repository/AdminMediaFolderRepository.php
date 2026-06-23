<?php

declare(strict_types=1);

namespace Common\App\Repository;

use Common\App\Models\AdminMediaFolder;
use Common\Shared\Util\Uuid as UuidUtil;
use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;

final readonly class AdminMediaFolderRepository
{
    public function __construct(
        private AdminMediaFolder $model,
        private UuidUtil $uuid,
    ) {}

    public function getEmptyModel(): AdminMediaFolder
    {
        return new AdminMediaFolder();
    }

    public function save(AdminMediaFolder $model): AdminMediaFolder
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

    public function getOneById(Uuid $id): ?AdminMediaFolder
    {
        return $this->model->query()
            ->where([
                'id' => $id->value(),
            ])
            ->limit(1)
            ->one();
    }

    /**
     * @return AdminMediaFolder[]
     */
    public function getListForTree(): array
    {
        return $this->model->query()
            ->select(['id', 'parent_id', 'name'])
            ->orderBy(['name' => \SORT_ASC])
            ->all();
    }

    /**
     * @return AdminMediaFolder[]
     */
    public function getList(?Uuid $parentId = null): array
    {
        return $this->model->query()
            ->where([
                'parent_id' => $parentId?->value(),
            ])
            ->orderBy(['name' => \SORT_ASC])
            ->all();
    }

    public function hasChildren(Uuid $id): bool
    {
        return $this->model->query()
            ->where([
                'parent_id' => $id->value(),
            ])
            ->exists();
    }

    public function countByParentId(Uuid $parentId): int
    {
        return (int) $this->model->query()
            ->where([
                'parent_id' => $parentId->value(),
            ])
            ->count();
    }

    public function hasByParentIdAndName(?Uuid $parentId, Text $name): bool
    {
        return $this->model->query()
            ->where([
                'parent_id' => $parentId?->value(),
                'name' => $name->value(),
            ])
            ->exists();
    }

    public function delete(AdminMediaFolder $model): void
    {
        $model->delete();
    }
}
