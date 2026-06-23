<?php

declare(strict_types=1);

namespace Common\Shared\Http\Upload;

use Common\Shared\Exception\ValidationException;
use finfo;
use Psr\Http\Message\UploadedFileInterface;
use Throwable;

final class UploadedFile
{
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/quicktime' => 'mov',
        'audio/mpeg' => 'mp3',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav',
        'audio/ogg' => 'ogg',
        'audio/webm' => 'webm',
        'application/pdf' => 'pdf',
    ];

    private const MIME_TYPES = [
        'image/jpeg' => UploadedFileType::Image,
        'image/png' => UploadedFileType::Image,
        'image/webp' => UploadedFileType::Image,
        'image/gif' => UploadedFileType::Image,
        'video/mp4' => UploadedFileType::Video,
        'video/webm' => UploadedFileType::Video,
        'video/quicktime' => UploadedFileType::Video,
        'audio/mpeg' => UploadedFileType::Audio,
        'audio/wav' => UploadedFileType::Audio,
        'audio/x-wav' => UploadedFileType::Audio,
        'audio/ogg' => UploadedFileType::Audio,
        'audio/webm' => UploadedFileType::Audio,
        'application/pdf' => UploadedFileType::Pdf,
    ];

    /** @var resource|null */
    private $resource;
    private int $size;
    private string $filename;
    private string $mimeType;
    private string $extension;
    private string $checksum;
    private UploadedFileType $type;

    /**
     * @param UploadedFileType[] $allowedTypes
     */
    public function __construct(
        UploadedFileInterface $file,
        private readonly string $field = 'file',
        ?int $maxSize = null,
        array $allowedTypes = [],
    ) {
        $this->assertUploaded($file);
        $this->size = $this->detectSize($file);

        if ($maxSize !== null && $this->size > $maxSize) {
            throw new ValidationException(
                messageKey: 'upload.file_too_large',
                messageParams: ['max' => $maxSize],
                field: $this->field,
            );
        }

        $this->resource = $this->openResource($file);

        try {
            $this->mimeType = $this->detectMimeType();
            $this->extension = $this->detectExtension($file);
            $this->type = self::MIME_TYPES[$this->mimeType] ?? UploadedFileType::Other;

            if ($allowedTypes !== [] && !in_array($this->type, $allowedTypes, true)) {
                throw new ValidationException(messageKey: 'upload.file_type_not_allowed', field: $this->field);
            }

            $this->checksum = $this->detectChecksum();
            $this->filename = $this->detectFilename($file);
            $this->rewind();
        } catch (Throwable $exception) {
            $this->close();

            throw $exception;
        }
    }

    public function size(): int
    {
        return $this->size;
    }

    public function filename(): string
    {
        return $this->filename;
    }

    public function mimeType(): string
    {
        return $this->mimeType;
    }

    public function extension(): string
    {
        return $this->extension;
    }

    public function type(): UploadedFileType
    {
        return $this->type;
    }

    public function checksum(): string
    {
        return $this->checksum;
    }

    /**
     * @return resource
     */
    public function stream()
    {
        if (!is_resource($this->resource)) {
            throw new ValidationException(messageKey: 'upload.file_invalid_stream', field: $this->field);
        }

        $this->rewind();

        return $this->resource;
    }

    public function close(): void
    {
        if (is_resource($this->resource)) {
            fclose($this->resource);
        }

        $this->resource = null;
    }

    /**
     * @param UploadedFileType[] $allowedTypes
     * @return string[]
     */
    public static function supportedExtensions(array $allowedTypes = []): array
    {
        $extensions = [];

        foreach (self::MIME_TYPES as $mimeType => $type) {
            if ($allowedTypes !== [] && !in_array($type, $allowedTypes, true)) {
                continue;
            }

            $extensions[] = self::MIME_EXTENSIONS[$mimeType];
        }

        return array_values(array_unique($extensions));
    }

    private function assertUploaded(UploadedFileInterface $file): void
    {
        $error = $file->getError();
        if ($error === UPLOAD_ERR_OK) {
            return;
        }

        throw new ValidationException(
            messageKey: match ($error) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'upload.file_upload_too_large',
                UPLOAD_ERR_NO_FILE => 'upload.file_required',
                default => 'upload.file_upload_failed',
            },
            field: $this->field,
        );
    }

    private function detectSize(UploadedFileInterface $file): int
    {
        $size = $file->getSize();
        if ($size === null) {
            throw new ValidationException(messageKey: 'upload.file_size_unknown', field: $this->field);
        }

        return $size;
    }

    /**
     * @return resource
     */
    private function openResource(UploadedFileInterface $file)
    {
        try {
            $resource = $file->getStream()->detach();
        } catch (Throwable) {
            throw new ValidationException(messageKey: 'upload.file_invalid_stream', field: $this->field);
        }

        if (!is_resource($resource)) {
            throw new ValidationException(messageKey: 'upload.file_invalid_stream', field: $this->field);
        }

        return $resource;
    }

    private function detectMimeType(): string
    {
        $head = fread($this->stream(), 8192);
        $this->rewind();

        if ($head === false || $head === '') {
            throw new ValidationException(messageKey: 'upload.file_empty', field: $this->field);
        }

        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->buffer($head);
        if (!is_string($mimeType) || $mimeType === '') {
            throw new ValidationException(messageKey: 'upload.file_type_unknown', field: $this->field);
        }

        return $mimeType;
    }

    private function detectExtension(UploadedFileInterface $file): string
    {
        $mimeExtension = self::MIME_EXTENSIONS[$this->mimeType] ?? null;
        if ($mimeExtension !== null) {
            return $mimeExtension;
        }

        $pathExtension = strtolower(pathinfo($this->filenameFromClient($file), PATHINFO_EXTENSION));
        if ($pathExtension !== '' && preg_match('/^[a-z0-9]+$/', $pathExtension) === 1) {
            return substr($pathExtension, 0, 32);
        }

        return 'bin';
    }

    private function detectChecksum(): string
    {
        $this->rewind();
        $context = hash_init('sha256');
        hash_update_stream($context, $this->stream());
        $this->rewind();

        return hash_final($context);
    }

    private function detectFilename(UploadedFileInterface $file): string
    {
        $clientFilename = $this->filenameFromClient($file);

        return $clientFilename === '' ? 'file.' . $this->extension : $clientFilename;
    }

    private function rewind(): void
    {
        if (is_resource($this->resource)) {
            rewind($this->resource);
        }
    }

    private function filenameFromClient(UploadedFileInterface $file): string
    {
        $clientFilename = trim((string) $file->getClientFilename());

        return $clientFilename === '' ? '' : basename(str_replace('\\', '/', $clientFilename));
    }
}
