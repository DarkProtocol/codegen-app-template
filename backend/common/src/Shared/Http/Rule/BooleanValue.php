<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Closure;
use Yiisoft\Validator\Rule\BooleanValue as YiiBooleanValue;
use Yiisoft\Validator\Rule\Trait\SkipOnEmptyTrait;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\Rule\Trait\WhenTrait;
use Yiisoft\Validator\SkipOnEmptyInterface;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\WhenInterface;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class BooleanValue extends AbstractRule implements SkipOnEmptyInterface, SkipOnErrorInterface, WhenInterface
{
    use SkipOnEmptyTrait;
    use SkipOnErrorTrait;
    use WhenTrait;

    public function __construct(
        int|float|string|bool $trueValue = '1',
        int|float|string|bool $falseValue = '0',
        bool $strict = false,
        string $incorrectInputMessage = 'validation.boolean.invalid',
        string $message = 'validation.boolean.invalid',
        bool|callable|null $skipOnEmpty = null,
        private bool $skipOnError = false,
        private ?Closure $when = null,
    ) {
        $this->skipOnEmpty = $skipOnEmpty;

        parent::__construct(new YiiBooleanValue(
            trueValue: $trueValue,
            falseValue: $falseValue,
            strict: $strict,
            incorrectInputMessage: $incorrectInputMessage,
            message: $message,
            skipOnEmpty: $skipOnEmpty,
            skipOnError: $skipOnError,
            when: $when,
        ));
    }
}
