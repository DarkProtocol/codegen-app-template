<?php

declare(strict_types=1);

namespace AdminApi\Controller\Account;

use AdminApi\Controller\AbstractController;
use AdminApi\Controller\Account\Request\ChangeAccountRequest;
use AdminApi\Controller\Account\Request\ChangePasswordRequest;
use AdminApi\Controller\Auth\Response\AccountResponse;
use Common\App\Service\AdminUser\Data\ChangeAccountDto;
use Common\App\Service\AdminUser\Service as AdminUserService;
use Common\Shared\Http\ResponseFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class Controller extends AbstractController
{
    public function __construct(
        private ResponseFactory $responseFactory,
        private AdminUserService $adminUserService,
    ) {}

    public function account(ServerRequestInterface $request, ChangeAccountRequest $input): ResponseInterface
    {
        return $this->responseFactory->ok(AccountResponse::fromModel(
            $this->adminUserService->changeAccount(
                $this->mustUser($request),
                new ChangeAccountDto(
                    firstName: $input->firstName(),
                    lastName: $input->lastName(),
                ),
            ),
        ));
    }

    public function password(ServerRequestInterface $request, ChangePasswordRequest $input): ResponseInterface
    {
        $this->adminUserService->changePassword(
            $this->mustUser($request),
            $input->currentPassword(),
            $input->password(),
        );

        return $this->responseFactory->noContent();
    }
}
