<?php

declare(strict_types=1);

namespace Common\Infra\Config;

use Common\Shared\Exception\MustException;
use RuntimeException;

final readonly class Config
{
    private const ENVIRONMENT_KEY = 'ENVIRONMENT';

    /** @var array<string, string|null> */
    private array $values;

    /** @param array<string, string|null>|null $values */
    public function __construct(?array $values = null)
    {
        $this->values = $values ?? self::loadValues();
    }

    public function environment(): EnvironmentEnum
    {
        $environment = $this->string(self::ENVIRONMENT_KEY, EnvironmentEnum::Prod->value);
        $enum = EnvironmentEnum::tryFrom($environment ?? EnvironmentEnum::Dev->value);

        if ($enum === null) {
            throw new RuntimeException(
                sprintf(
                    '%s="%s" is invalid. Valid values are "%s".',
                    self::ENVIRONMENT_KEY,
                    $environment,
                    implode('", "', array_column(EnvironmentEnum::cases(), 'value')),
                ),
            );
        }

        return $enum;
    }

    public function isDev(): bool {
        return $this->environment() === EnvironmentEnum::Dev;
    }

    public function isProd(): bool {
        return $this->environment() === EnvironmentEnum::Prod;
    }

    public function bool(string $key, ?bool $default = null): ?bool
    {
        $value = $this->raw($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }

    public function mustBool(string $key): bool
    {
        $value = $this->bool($key);

        if ($value === null) {
            throw new MustException($key);
        }

        return $value;
    }

    /**
     * @return non-empty-string|null
     */
    public function string(string $key, ?string $default = null): ?string
    {
        $value = $this->raw($key);

        return $value === null || $value === '' ? $default : $value;
    }

    /**
     * @return non-empty-string
     */
    public function mustString(string $key): string
    {
        $value = $this->string($key);

        if ($value === null) {
            throw new MustException($key);
        }

        return $value;
    }

    private function raw(string $key): ?string
    {
        if (array_key_exists($key, $this->values)) {
            return $this->values[$key];
        }

        return null;
    }

    /**
     * @return array<string, string|null>
     */
    private static function loadValues(): array
    {
        $values = [];

        foreach ($_ENV as $key => $value) {
            $values[(string) $key] = (string) $value;
        }

        foreach (getenv() as $key => $value) {
            $values[(string) $key] = (string) $value;
        }

        return $values;
    }
}
