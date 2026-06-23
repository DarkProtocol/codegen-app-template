<?php

declare(strict_types=1);

namespace Common\App\Models;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;
use LogicException;
use Yiisoft\ActiveRecord\Trait\PrivatePropertiesTrait;

final class AdminMediaFolder extends AbstractModel
{
    use PrivatePropertiesTrait;

    private string $id;
    private ?string $parent_id = null;
    private string $name;
    private ?string $created_by = null;
    private ?DateTimeImmutable $created_at = null;
    private ?DateTimeImmutable $updated_at = null;

    public function tableName(): string
    {
        return '{{%admin_media_folders}}';
    }

    public function getId(): Uuid
    {
        return new Uuid($this->id);
    }

    public function setId(Uuid $id): void
    {
        $this->id = $id->value();
    }

    public function getParentId(): ?Uuid
    {
        return $this->parent_id === null ? null : new Uuid($this->parent_id);
    }

    public function setParentId(?Uuid $parentId): void
    {
        $this->parent_id = $parentId?->value();
    }

    public function getName(): Text
    {
        return new Text($this->name);
    }

    public function setName(Text $name): void
    {
        $this->name = $name->value();
    }

    public function getCreatedBy(): ?Uuid
    {
        return $this->created_by === null ? null : new Uuid($this->created_by);
    }

    public function setCreatedBy(?Uuid $createdBy): void
    {
        $this->created_by = $createdBy?->value();
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->created_at ?? throw new LogicException('Admin media folder createdAt is not set.');
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): void
    {
        $this->created_at = $createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updated_at ?? throw new LogicException('Admin media folder updatedAt is not set.');
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): void
    {
        $this->updated_at = $updatedAt;
    }
}
