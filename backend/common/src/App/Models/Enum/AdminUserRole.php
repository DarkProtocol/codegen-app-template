<?php

declare(strict_types=1);

namespace Common\App\Models\Enum;

enum AdminUserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
}
