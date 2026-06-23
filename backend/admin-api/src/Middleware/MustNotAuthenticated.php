<?php

declare(strict_types=1);

namespace AdminApi\Middleware;

use Common\Shared\Http\Exception\ForbiddenException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class MustNotAuthenticated implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $user = Authenticate::user($request);
        if ($user) {
            throw new ForbiddenException();
        }

        return $handler->handle($request);
    }
}
