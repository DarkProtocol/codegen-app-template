<?php

declare(strict_types=1);

namespace Common\App\Models;

use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;
use LogicException;
use Yiisoft\ActiveRecord\Trait\PrivatePropertiesTrait;

final class AdminMediaFile extends AbstractModel
{
    use PrivatePropertiesTrait;

    private string $id;
    private ?string $folder_id = null;
    private string $storage_key;
    private string $original_name;
    private string $name;
    private string $extension;
    private string $mime_type;
    private int $size;
    private string $checksum;
    private bool $is_public = false;
    private string $created_by;
    private ?DateTimeImmutable $created_at = null;
    private ?DateTimeImmutable $updated_at = null;

    public function tableName(): string
    {
        return '{{%admin_media_files}}';
    }

    public function getId(): Uuid
    {
        return new Uuid($this->id);
    }

    public function setId(Uuid $id): void
    {
        $this->id = $id->value();
    }

    public function getFolderId(): ?Uuid
    {
        return $this->folder_id === null ? null : new Uuid($this->folder_id);
    }

    public function setFolderId(?Uuid $folderId): void
    {
        $this->folder_id = $folderId?->value();
    }

    public function getStorageKey(): Text
    {
        return new Text($this->storage_key);
    }

    public function setStorageKey(Text $storageKey): void
    {
        $this->storage_key = $storageKey->value();
    }

    public function getOriginalName(): Text
    {
        return new Text($this->original_name);
    }

    public function setOriginalName(Text $originalName): void
    {
        $this->original_name = $originalName->value();
    }

    public function getName(): Text
    {
        return new Text($this->name);
    }

    public function setName(Text $name): void
    {
        $this->name = $name->value();
    }

    public function getExtension(): Text
    {
        return new Text($this->extension);
    }

    public function setExtension(Text $extension): void
    {
        $this->extension = $extension->value();
    }

    public function getMimeType(): Text
    {
        return new Text($this->mime_type);
    }

    public function setMimeType(Text $mimeType): void
    {
        $this->mime_type = $mimeType->value();
    }

    public function getSize(): int
    {
        return $this->size;
    }

    public function setSize(int $size): void
    {
        $this->size = $size;
    }

    public function getChecksum(): Text
    {
        return new Text($this->checksum);
    }

    public function setChecksum(Text $checksum): void
    {
        $this->checksum = $checksum->value();
    }

    public function isPublic(): bool
    {
        return $this->is_public;
    }

    public function setIsPublic(bool $isPublic): void
    {
        $this->is_public = $isPublic;
    }

    public function getCreatedBy(): Uuid
    {
        return new Uuid($this->created_by);
    }

    public function setCreatedBy(Uuid $createdBy): void
    {
        $this->created_by = $createdBy->value();
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->created_at ?? throw new LogicException('Admin media file createdAt is not set.');
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): void
    {
        $this->created_at = $createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updated_at ?? throw new LogicException('Admin media file updatedAt is not set.');
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): void
    {
        $this->updated_at = $updatedAt;
    }
}
