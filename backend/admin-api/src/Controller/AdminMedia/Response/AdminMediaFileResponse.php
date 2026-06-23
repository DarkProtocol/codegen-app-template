<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia\Response;

use Common\App\Models\AdminMediaFile;
use DateTimeInterface;

final class AdminMediaFileResponse
{
    private const UPLOADS_PATH = '/uploads';

    public function __construct(
        public string $id,
        public string $publicUrl,
        public ?string $folderId,
        public string $originalName,
        public string $name,
        public string $extension,
        public string $mimeType,
        public int $size,
        public string $checksum,
        public bool $isPublic,
        public string $createdBy,
        public string $createdAt,
    ) {}

    public static function fromModel(AdminMediaFile $model, string $baseUrl): self
    {
        return new self(
            id: $model->getId()->value(),
            publicUrl: sprintf('%s%s/%s', rtrim($baseUrl, '/'), self::UPLOADS_PATH, $model->getId()->value()),
            folderId: $model->getFolderId()?->value(),
            originalName: $model->getOriginalName()->value(),
            name: $model->getName()->value(),
            extension: $model->getExtension()->value(),
            mimeType: $model->getMimeType()->value(),
            size: $model->getSize(),
            checksum: $model->getChecksum()->value(),
            isPublic: $model->isPublic(),
            createdBy: $model->getCreatedBy()->value(),
            createdAt: $model->getCreatedAt()->format(DateTimeInterface::ATOM),
        );
    }
}
