<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Attribute;
use Common\Shared\Exception\ValidationException;
use Stringable;
use Yiisoft\Validator\Result;
use Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait;
use Yiisoft\Validator\RuleHandlerInterface;
use Yiisoft\Validator\RuleInterface;
use Yiisoft\Validator\SkipOnErrorInterface;
use Yiisoft\Validator\ValidationContext;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::IS_REPEATABLE)]
final class ValueObject implements RuleInterface, RuleHandlerInterface, SkipOnErrorInterface
{
    use SkipOnErrorTrait;

    /**
     * @param class-string $class
     */
    public function __construct(
        private readonly string $class,
        // Required by Yiisoft\Validator\Rule\Trait\SkipOnErrorTrait.
        // @phpstan-ignore property.onlyWritten
        private bool $skipOnError = true,
    ) {}

    public function getHandler(): RuleHandlerInterface
    {
        return $this;
    }

    public function validate(mixed $value, RuleInterface $rule, ValidationContext $context): Result
    {
        $result = new Result();
        if ($value === null || $value === '') {
            return $result;
        }

        if (!is_scalar($value) && !$value instanceof Stringable) {
            return $result->addError('validation.value.scalar');
        }

        try {
            new $this->class((string) $value);
        } catch (ValidationException $exception) {
            $result->addError($exception->messageKey(), $exception->messageParams());
        }

        return $result;
    }
}
