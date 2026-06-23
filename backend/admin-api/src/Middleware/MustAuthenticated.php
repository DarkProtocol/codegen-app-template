<?php

declare(strict_types=1);

namespace AdminApi\Middleware;

use Common\Shared\Http\Exception\NotAuthorizedException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class MustAuthenticated implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $user = Authenticate::user($request);
        if (!$user) {
            throw new NotAuthorizedException();
        }

        return $handler->handle($request);
    }
}
