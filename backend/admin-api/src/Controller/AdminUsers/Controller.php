<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminUsers;

use AdminApi\Controller\AbstractController;
use AdminApi\Controller\AdminUsers\Request\ChangeRoleRequest;
use AdminApi\Controller\AdminUsers\Request\CreateRequest;
use AdminApi\Controller\AdminUsers\Request\ListRequest;
use AdminApi\Controller\AdminUsers\Request\ResetPasswordRequest;
use AdminApi\Controller\AdminUsers\Response\AdminUserRoleResponse;
use AdminApi\Controller\AdminUsers\Response\AdminUserResponse;
use Common\App\Models\Enum\AdminUserRole;
use Common\App\Service\AdminUser\Data\CreateDto;
use Common\App\Service\AdminUser\Service as AdminUserService;
use Common\Shared\Http\Exception\ForbiddenException;
use Common\Shared\Http\Exception\NotFoundException;
use Common\Shared\Http\PaginationRequest;
use Common\Shared\Http\PaginationResponse;
use Common\Shared\Http\ResponseFactory;
use Common\Shared\ValueObject\Uuid;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Controller extends AbstractController
{
    public function __construct(
        private ResponseFactory $responseFactory,
        private AdminUserService $adminUserService,
    ) {}

    public function create(CreateRequest $input): ResponseInterface
    {
        return $this->responseFactory->created(
            AdminUserResponse::fromModel($this->adminUserService->create(new CreateDto(
                email: $input->email(),
                firstName: $input->firstName(),
                lastName: $input->lastName(),
                password: $input->password(),
                role: $input->role(),
            ))),
        );
    }

    public function ban(#[RouteArgument] string $id, ServerRequestInterface $request): ResponseInterface
    {
        $uuid = new Uuid($id, field: 'id');
        $this->mustNotSelf($request, $uuid);
        if (!$this->adminUserService->ban($uuid)) {
            throw new NotFoundException();
        }
        return $this->responseFactory->noContent();
    }

    public function unban(#[RouteArgument] string $id, ServerRequestInterface $request): ResponseInterface
    {
        $uuid = new Uuid($id, field: 'id');
        $this->mustNotSelf($request, $uuid);
        if (!$this->adminUserService->unban($uuid)) {
            throw new NotFoundException();
        }
        return $this->responseFactory->noContent();
    }

    public function password(
        #[RouteArgument] string $id,
        ResetPasswordRequest $input,
        ServerRequestInterface $request
    ): ResponseInterface {
        $uuid = new Uuid($id, field: 'id');
        $this->mustNotSelf($request, $uuid);
        if (!$this->adminUserService->resetPassword($uuid, $input->password())) {
            throw new NotFoundException();
        }
        return $this->responseFactory->noContent();
    }

    public function role(
        #[RouteArgument] string $id,
        ChangeRoleRequest $input,
        ServerRequestInterface $request
    ): ResponseInterface {
        $uuid = new Uuid($id, field: 'id');
        $this->mustNotSelf($request, $uuid);
        if (!$this->adminUserService->changeRole($uuid, $input->role())) {
            throw new NotFoundException();
        }
        return $this->responseFactory->noContent();
    }

    public function list(ListRequest $input): ResponseInterface
    {
        $pagination = $this->adminUserService->getList(new PaginationRequest(
            page: $input->page(),
            perPage: $input->perPage(),
        ));

        return $this->responseFactory->ok(new PaginationResponse(
            data: array_map(AdminUserResponse::fromModel(...), $pagination->data),
            count: $pagination->count,
            currentPage: $pagination->currentPage,
            perPage: $pagination->perPage,
            pages: $pagination->pages,
        ));
    }

    public function roles(): ResponseInterface
    {
        return $this->responseFactory->ok(array_map(
            AdminUserRoleResponse::fromEnum(...),
            AdminUserRole::cases(),
        ));
    }

    private function mustNotSelf(ServerRequestInterface $request, Uuid $compare)
    {
        $selfId = $this->mustUser($request)->getId();
        if ($selfId->equals($compare)) {
            throw new ForbiddenException();
        }
    }
}
