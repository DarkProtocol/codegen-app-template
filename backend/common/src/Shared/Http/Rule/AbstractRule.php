<?php

declare(strict_types=1);

namespace Common\Shared\Http\Rule;

use Yiisoft\Validator\Result;
use Yiisoft\Validator\RuleHandlerInterface;
use Yiisoft\Validator\RuleInterface;
use Yiisoft\Validator\ValidationContext;

abstract class AbstractRule implements RuleInterface, RuleHandlerInterface
{
    public function __construct(
        private readonly RuleInterface $rule,
    ) {}

    public function getHandler(): RuleHandlerInterface
    {
        return $this;
    }

    public function validate(mixed $value, RuleInterface $rule, ValidationContext $context): Result
    {
        $handler = $this->rule->getHandler();
        if (is_string($handler)) {
            $handler = new $handler();
        }

        return $handler->validate($value, $this->rule, $context);
    }
}
