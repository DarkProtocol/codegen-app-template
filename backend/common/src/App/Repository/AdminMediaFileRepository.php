<?php

declare(strict_types=1);

namespace Common\App\Repository;

use Common\App\Models\AdminMediaFile;
use Common\Shared\Util\Uuid as UuidUtil;
use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;

final readonly class AdminMediaFileRepository
{
    public function __construct(
        private AdminMediaFile $model,
        private UuidUtil $uuid,
    ) {}

    public function getEmptyModel(): AdminMediaFile
    {
        return new AdminMediaFile();
    }

    public function save(AdminMediaFile $model): AdminMediaFile
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

    public function getOneById(Uuid $id): ?AdminMediaFile
    {
        /** @var AdminMediaFile|null */
        return $this->model->query()
            ->where([
                'id' => $id->value(),
            ])
            ->one();
    }

    public function hasByFolderId(Uuid $folderId): bool
    {
        return $this->model->query()
            ->where([
                'folder_id' => $folderId->value(),
            ])
            ->exists();
    }

    public function countByFolderId(Uuid $folderId): int
    {
        return (int) $this->model->query()
            ->where([
                'folder_id' => $folderId->value(),
            ])
            ->count();
    }

    /**
     * @return AdminMediaFile[]
     */
    public function getList(?Uuid $folderId = null): array
    {
        return $this->model->query()
            ->where([
                'folder_id' => $folderId?->value(),
            ])
            ->orderBy(['name' => \SORT_ASC])
            ->all();
    }

    public function hasByFolderIdAndName(?Uuid $folderId, Text $name): bool
    {
        return $this->getOneByFolderIdAndName($folderId, $name) !== null;
    }

    public function getOneByFolderIdAndName(?Uuid $folderId, Text $name): ?AdminMediaFile
    {
        $query = $this->model->query()
            ->where([
                'name' => $name->value(),
            ]);

        if ($folderId === null) {
            $query->andWhere(['folder_id' => null]);
        } else {
            $query->andWhere(['folder_id' => $folderId->value()]);
        }

        /** @var AdminMediaFile|null */
        return $query->one();
    }

    public function delete(AdminMediaFile $model): void
    {
        $model->delete();
    }
}
