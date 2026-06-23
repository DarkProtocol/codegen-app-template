<?php

declare(strict_types=1);

namespace Common\Shared\Http\Upload;

enum UploadedFileType: string
{
    case Image = 'image';
    case Video = 'video';
    case Audio = 'audio';
    case Pdf = 'pdf';
    case Other = 'other';

    public function isMedia(): bool
    {
        return in_array($this, [self::Image, self::Video, self::Audio], true);
    }
}
