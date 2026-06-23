<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Closure;
use Yiisoft\Validator\Rule\Length as YiiLength;
use Yiisoft\Validator\Rule\Trait\SkipOnEmptyTrait;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\Rule\Trait\WhenTrait;
use Yiisoft\Validator\SkipOnEmptyInterface;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\WhenInterface;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class Length extends AbstractRule implements SkipOnEmptyInterface, SkipOnErrorInterface, WhenInterface
{
    use SkipOnEmptyTrait;
    use SkipOnErrorTrait;
    use WhenTrait;

    public function __construct(
        ?int $exactly = null,
        ?int $min = null,
        ?int $max = null,
        string $incorrectInputMessage = 'validation.string.invalid',
        string $lessThanMinMessage = 'validation.string.too_short',
        string $greaterThanMaxMessage = 'validation.string.too_long',
        string $notExactlyMessage = 'validation.string.length',
        string $encoding = 'UTF-8',
        bool|callable|null $skipOnEmpty = null,
        private bool $skipOnError = false,
        private ?Closure $when = null,
    ) {
        $this->skipOnEmpty = $skipOnEmpty;

        parent::__construct(new YiiLength(
            exactly: $exactly,
            min: $min,
            max: $max,
            incorrectInputMessage: $incorrectInputMessage,
            lessThanMinMessage: $lessThanMinMessage,
            greaterThanMaxMessage: $greaterThanMaxMessage,
            notExactlyMessage: $notExactlyMessage,
            encoding: $encoding,
            skipOnEmpty: $skipOnEmpty,
            skipOnError: $skipOnError,
            when: $when,
        ));
    }
}
