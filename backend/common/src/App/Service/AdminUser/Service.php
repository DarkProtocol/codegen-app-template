<?php

declare(strict_types=1);

namespace Common\App\Service\AdminUser;

use Common\App\Models\AdminUser;
use Common\App\Models\Enum\AdminUserRole;
use Common\App\Repository\AdminUserRepository;
use Common\App\Service\AbstractService;
use Common\App\Service\AdminUser\Data\ChangeAccountDto;
use Common\App\Service\AdminUser\Data\CreateDto;
use Common\Shared\Exception\ValidationException;
use Common\Shared\Http\PaginationRequest;
use Common\Shared\Http\PaginationResponse;
use Common\Shared\ValueObject\Email;
use Common\Shared\ValueObject\NewPassword;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;
use Psr\Log\LoggerInterface;

final readonly class Service extends AbstractService
{
    public function __construct(
        LoggerInterface $logger,
        private AdminUserRepository $adminUserRepo,
    ) {
        parent::__construct($logger);
    }

    public function create(CreateDto $dto): AdminUser
    {
        if ($this->adminUserRepo->getOneByEmail($dto->email) !== null) {
            throw new ValidationException(messageKey: 'admin_user.email_already_exists', field: 'email');
        }

        $adminUser = $this->adminUserRepo->getEmptyModel();
        $adminUser->setEmail($dto->email);
        $adminUser->setFirstName($dto->firstName);
        $adminUser->setLastName($dto->lastName);
        $adminUser->setPassword(password_hash($dto->password->value(), PASSWORD_DEFAULT));
        $adminUser->setRole($dto->role);

        return $this->adminUserRepo->save($adminUser);
    }

    public function changeAccount(AdminUser $user, ChangeAccountDto $dto): AdminUser
    {
        $user->setFirstName($dto->firstName);
        $user->setLastName($dto->lastName);

        return $this->adminUserRepo->save($user);
    }

    public function getNotBannedUserByEmail(Email $email): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneByEmail($email)) {
            return null;
        }

        return $user->getBannedAt() ? null : $user;
    }

    public function getNotBannedUserById(Uuid $id): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneById($id)) {
            return null;
        }

        return $user->getBannedAt() ? null : $user;
    }

    public function verifyPassword(AdminUser $user, string $pass): bool
    {
        return password_verify($pass, $user->getPassword());
    }

    public function changePassword(
        AdminUser $user,
        string $currentPassword,
        NewPassword $password,
    ): AdminUser {
        if (!$this->verifyPassword($user, $currentPassword)) {
            throw new ValidationException(
                messageKey: 'admin_user.current_password_invalid',
                field: 'currentPassword',
            );
        }

        $user->setPassword(password_hash($password->value(), PASSWORD_DEFAULT));

        return $this->adminUserRepo->save($user);
    }

    public function resetPassword(Uuid $id, NewPassword $password): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneById($id)) {
            return null;
        }

        $user->setPassword(password_hash($password->value(), PASSWORD_DEFAULT));
        return $this->adminUserRepo->save($user);
    }

    public function changeRole(Uuid $id, AdminUserRole $role): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneById($id)) {
            return null;
        }

        $user->setRole($role);
        return $this->adminUserRepo->save($user);
    }

    public function ban(Uuid $id): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneById($id)) {
            return null;
        }

        $user->setBannedAt(new DateTimeImmutable());
        return $this->adminUserRepo->save($user);
    }

    public function unban(Uuid $id): ?AdminUser
    {
        if (!$user = $this->adminUserRepo->getOneById($id)) {
            return null;
        }

        $user->setBannedAt(null);
        return $this->adminUserRepo->save($user);
    }

    public function getList(PaginationRequest $pagination): PaginationResponse
    {
        return PaginationResponse::fromPagination(
            data: $this->adminUserRepo->getList($pagination),
            count: $this->adminUserRepo->count(),
            pagination: $pagination,
        );
    }
}
