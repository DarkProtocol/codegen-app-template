<?php

declare(strict_types=1);

namespace Common\Shared;

use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Translator\SimpleMessageFormatter;
use Yiisoft\Validator\Result;

final readonly class Translator
{
    private const DEFAULT_LOCALE = 'en';

    /**
     * @param array<string, string> $messages
     */
    private function __construct(
        private array $messages,
        private string $locale,
        private SimpleMessageFormatter $formatter,
    ) {}

    /**
     * @param string[] $files
     */
    public static function fromRequest(array $files, ServerRequestInterface $request): self
    {
        $requestedLocale = self::resolveLocale($request);
        $locale = self::DEFAULT_LOCALE;
        $messages = [];

        foreach ($files as $file) {
            if (!is_file($file)) {
                continue;
            }

            $fileMessages = require $file;
            if (isset($fileMessages[$requestedLocale])) {
                $locale = $requestedLocale;
            }

            $messages = array_merge(
                $messages,
                $fileMessages[$requestedLocale] ?? $fileMessages[self::DEFAULT_LOCALE] ?? [],
            );
            unset($fileMessages);
        }

        return new self(
            messages: $messages,
            locale: $locale,
            formatter: new SimpleMessageFormatter(),
        );
    }

    /**
     * @param array<string, scalar|null> $params
     */
    public function translate(string $key, array $params = []): string
    {
        $message = $this->messages[$key] ?? $key;

        return $this->formatter->format($message, $params, $this->locale);
    }

    /**
     * @return array<string, string>
     */
    public function translateResult(Result $result): array
    {
        $errors = [];

        foreach ($result->getErrors() as $error) {
            $property = (string) ($error->getValuePath()[0] ?? '');
            if (isset($errors[$property])) {
                continue;
            }

            $errors[$property] = $this->translate($error->getMessage(), $error->getParameters());
        }

        return $errors;
    }

    private static function resolveLocale(ServerRequestInterface $request): string
    {
        $locale = trim(explode(',', $request->getHeaderLine('Accept-Language'))[0]);
        $locale = trim(explode(';', $locale)[0]);

        if ($locale === '') {
            return self::DEFAULT_LOCALE;
        }

        return strtolower(substr($locale, 0, 2));
    }
}
