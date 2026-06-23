<?php

declare(strict_types=1);

namespace AdminApi\Controller;

use AdminApi\Middleware\Authenticate;
use Common\App\Models\AdminUser;
use Common\Shared\Exception\MustException;
use Psr\Http\Message\ServerRequestInterface;

abstract readonly class AbstractController
{
    protected function user(ServerRequestInterface $request): ?AdminUser
    {
        return Authenticate::user($request);
    }

    protected function mustUser(ServerRequestInterface $request): AdminUser
    {
        if (!$user = $this->user($request)) {
            throw new MustException('user');
        }

        return $user;
    }

    protected function baseUrl(ServerRequestInterface $request): string
    {
        $uri = $request->getUri();
        $scheme = $this->firstHeaderValue($request, 'X-Forwarded-Proto') ?? $uri->getScheme();
        $host = $this->firstHeaderValue($request, 'X-Forwarded-Host')
            ?? $this->firstHeaderValue($request, 'Host')
            ?? $uri->getAuthority();

        if (!in_array($scheme, ['http', 'https'], true)) {
            $scheme = $uri->getScheme();
        }

        return sprintf('%s://%s', $scheme, $host);
    }

    private function firstHeaderValue(ServerRequestInterface $request, string $name): ?string
    {
        $value = trim($request->getHeaderLine($name));

        if ($value === '') {
            return null;
        }

        $values = explode(',', $value);
        $firstValue = trim($values[0]);

        return $firstValue === '' ? null : $firstValue;
    }
}
