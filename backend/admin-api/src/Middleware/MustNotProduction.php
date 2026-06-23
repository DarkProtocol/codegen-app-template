<?php

declare(strict_types=1);

namespace AdminApi\Middleware;

use Common\Infra\Config\Config;
use Common\Shared\Http\Exception\NotFoundException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class MustNotProduction implements MiddlewareInterface
{
    public function __construct(
        private Config $config,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($this->config->isProd()) {
            throw new NotFoundException();
        }

        return $handler->handle($request);
    }
}
