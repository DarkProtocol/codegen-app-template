<?php

declare(strict_types=1);

namespace AdminApi\Controller\Auth;

use AdminApi\Controller\AbstractController;
use AdminApi\Controller\Auth\Request\LoginRequest;
use AdminApi\Controller\Auth\Response\WhoamiResponse;
use AdminApi\Service\AuthService;
use AdminApi\Service\AdminAccess;
use Common\App\Service\AdminUser\Service as AdminUserService;
use Common\Shared\Http\Exception\NotFoundException;
use Common\Shared\Http\ResponseFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class Controller extends AbstractController
{
    public function __construct(
        private ResponseFactory $responseFactory,
        private AdminUserService $adminUserService,
        private AuthService $authService,
        private AdminAccess $adminAccess,
    ) {}

    public function login(ServerRequestInterface $request, LoginRequest $input): ResponseInterface
    {
        if (!$user = $this->adminUserService->getNotBannedUserByEmail($input->email())) {
            throw new NotFoundException();
        }

        $this->authService->ensureLoginAttemptsAllowed($user);

        if (!$this->adminUserService->verifyPassword($user, $input->password())) {
            $this->authService->registerFailedLoginAttempt($user);
            throw new NotFoundException();
        }

        $cookie = $this->authService->login($user, $request);
        return $cookie->addToResponse($this->responseFactory->noContent());
    }

    public function whoami(ServerRequestInterface $request): ResponseInterface
    {
        $user = $this->mustUser($request);

        return $this->responseFactory->ok(WhoamiResponse::fromModel(
            model: $user,
            can: $this->adminAccess->permissions($user),
        ));
    }

    public function logout(ServerRequestInterface $request): ResponseInterface
    {
        $cookie = $this->authService->generateExpiredCookie($request);

        return $cookie->addToResponse($this->responseFactory->noContent());
    }
}
