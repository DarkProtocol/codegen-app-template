<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Closure;
use Yiisoft\Validator\Rule\Email as YiiEmail;
use Yiisoft\Validator\Rule\Trait\SkipOnEmptyTrait;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\Rule\Trait\WhenTrait;
use Yiisoft\Validator\SkipOnEmptyInterface;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\WhenInterface;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class Email extends AbstractRule implements SkipOnEmptyInterface, SkipOnErrorInterface, WhenInterface
{
    use SkipOnEmptyTrait;
    use SkipOnErrorTrait;
    use WhenTrait;

    public function __construct(
        bool $allowName = false,
        bool $checkDns = false,
        bool $enableIdn = false,
        string $incorrectInputMessage = 'validation.string.invalid',
        string $message = 'validation.email.invalid',
        bool|callable|null $skipOnEmpty = null,
        private bool $skipOnError = false,
        private ?Closure $when = null,
    ) {
        $this->skipOnEmpty = $skipOnEmpty;

        parent::__construct(new YiiEmail(
            allowName: $allowName,
            checkDns: $checkDns,
            enableIdn: $enableIdn,
            incorrectInputMessage: $incorrectInputMessage,
            message: $message,
            skipOnEmpty: $skipOnEmpty,
            skipOnError: $skipOnError,
            when: $when,
        ));
    }
}
