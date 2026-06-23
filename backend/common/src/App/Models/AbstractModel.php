<?php

declare(strict_types=1);

namespace Common\App\Models;

use Yiisoft\ActiveRecord\ActiveRecord;
use Yiisoft\ActiveRecord\Trait\EventsTrait;
use Yiisoft\ActiveRecord\Trait\MagicPropertiesTrait;
use Yiisoft\ActiveRecord\Trait\MagicRelationsTrait;

abstract class AbstractModel extends ActiveRecord
{
    use MagicRelationsTrait;
    use MagicPropertiesTrait; // Required for `Yiisoft\Data\Paginator\KeysetPaginator`
    use EventsTrait;
}
