<?php

declare(strict_types=1);

namespace AdminApi\Middleware;

use AdminApi\Service\AdminAccess;
use Common\Shared\Http\Exception\ForbiddenException;
use Common\Shared\Http\Exception\NotAuthorizedException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class Can implements MiddlewareInterface
{
    public static function withPermission(string $permission): array
    {
        return [
            'class' => self::class,
            '__construct()' => [
                'permission' => $permission,
            ],
        ];
    }

    public function __construct(
        private string $permission,
        private AdminAccess $adminAccess,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (!$user = Authenticate::user($request)) {
            throw new NotAuthorizedException();
        }

        if (!$this->adminAccess->can($user, $this->permission)) {
            throw new ForbiddenException();
        }

        return $handler->handle($request);
    }
}
