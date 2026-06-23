<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Closure;
use Yiisoft\Validator\Rule\Number as YiiNumber;
use Yiisoft\Validator\Rule\Trait\SkipOnEmptyTrait;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\Rule\Trait\WhenTrait;
use Yiisoft\Validator\SkipOnEmptyInterface;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\WhenInterface;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class Number extends AbstractRule implements SkipOnEmptyInterface, SkipOnErrorInterface, WhenInterface
{
    use SkipOnEmptyTrait;
    use SkipOnErrorTrait;
    use WhenTrait;

    public function __construct(
        float|int|null $min = null,
        float|int|null $max = null,
        string $incorrectInputMessage = 'validation.number.invalid',
        string $notNumberMessage = 'validation.number.invalid',
        string $lessThanMinMessage = 'validation.number.too_small',
        string $greaterThanMaxMessage = 'validation.number.too_big',
        string $pattern = '/^\s*[-+]?\d*\.?\d+([eE][-+]?\d+)?\s*$/',
        bool|callable|null $skipOnEmpty = null,
        private bool $skipOnError = false,
        private ?Closure $when = null,
    ) {
        $this->skipOnEmpty = $skipOnEmpty;

        parent::__construct(new YiiNumber(
            min: $min,
            max: $max,
            incorrectInputMessage: $incorrectInputMessage,
            notNumberMessage: $notNumberMessage,
            lessThanMinMessage: $lessThanMinMessage,
            greaterThanMaxMessage: $greaterThanMaxMessage,
            pattern: $pattern,
            skipOnEmpty: $skipOnEmpty,
            skipOnError: $skipOnError,
            when: $when,
        ));
    }
}
