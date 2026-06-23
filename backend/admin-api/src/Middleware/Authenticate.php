<?php

declare(strict_types=1);

namespace AdminApi\Middleware;

use AdminApi\Service\AuthService;
use Common\App\Models\AdminUser;
use Common\App\Service\AdminUser\Service as AdminUserService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Yiisoft\Cookies\CookieCollection;

final readonly class Authenticate implements MiddlewareInterface
{
    public const USER_ATTRIBUTE = 'user';

    public function __construct(
        private AuthService $authService,
        private AdminUserService $adminUserService,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $cookies = CookieCollection::fromArray($request->getCookieParams());
        $jwt = $this->authService->getJwt($cookies);

        if (!$jwt = $this->authService->getJwt($cookies)) {
            return $handler->handle($request);
        }

        if (!$userId = $this->authService->getUserId($jwt)) {
            return $handler->handle($request);
        }

        if (!$user = $this->adminUserService->getNotBannedUserById($userId)) {
            return $handler->handle($request);
        }

        $request = $request->withAttribute(self::USER_ATTRIBUTE, $user);
        $response = $handler->handle($request);
        
        if ($this->authService->shouldRefresh($jwt)) {
            return $this->authService->generateCookie($user, $request)->addToResponse($response);
        }

        return $response;
    }

    public static function user(ServerRequestInterface $request): ?AdminUser
    {
        $user = $request->getAttribute(self::USER_ATTRIBUTE);

        return $user instanceof AdminUser ? $user : null;
    }
}
