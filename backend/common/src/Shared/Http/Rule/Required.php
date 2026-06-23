<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Closure;
use Yiisoft\Validator\Rule\Required as YiiRequired;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\Rule\Trait\WhenTrait;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\WhenInterface;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class Required extends AbstractRule implements SkipOnErrorInterface, WhenInterface
{
    use SkipOnErrorTrait;
    use WhenTrait;

    public function __construct(
        string $message = 'validation.not_empty',
        string $notPassedMessage = 'validation.required',
        ?callable $emptyCondition = null,
        private bool $skipOnError = false,
        private ?Closure $when = null,
    ) {
        parent::__construct(new YiiRequired(
            message: $message,
            notPassedMessage: $notPassedMessage,
            emptyCondition: $emptyCondition,
            skipOnError: $skipOnError,
            when: $when,
        ));
    }
}
