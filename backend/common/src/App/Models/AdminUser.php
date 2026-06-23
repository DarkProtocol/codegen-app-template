<?php

declare(strict_types=1);

namespace Common\App\Models;

use Common\App\Models\Enum\AdminUserRole;
use Common\Shared\ValueObject\Email;
use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;
use Common\Shared\ValueObject\Uuid;
use DateTimeImmutable;
use LogicException;
use Yiisoft\ActiveRecord\Trait\PrivatePropertiesTrait;

final class AdminUser extends AbstractModel
{
    use PrivatePropertiesTrait;

    private string $id;
    private string $email;
    private string $first_name;
    private ?string $last_name = null;
    private string $password;
    private string $role;
    private ?DateTimeImmutable $created_at = null;
    private ?DateTimeImmutable $updated_at = null;
    private ?DateTimeImmutable $banned_at = null;

    public function tableName(): string
    {
        return '{{%admin_users}}';
    }

    public function getId(): Uuid
    {
        return new Uuid($this->id);
    }

    public function setId(Uuid $id): void
    {
        $this->id = $id->value();
    }

    public function getEmail(): Email
    {
        return new Email($this->email);
    }

    public function setEmail(Email $email): void
    {
        $this->email = $email->value();
    }

    public function getFirstName(): Text
    {
        return new Text($this->first_name);
    }

    public function setFirstName(Text $firstName): void
    {
        $this->first_name = $firstName->value();
    }

    public function getLastName(): NullableText
    {
        return new NullableText($this->last_name);
    }

    public function setLastName(NullableText $lastName): void
    {
        $this->last_name = $lastName->value();
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getRole(): AdminUserRole
    {
        return AdminUserRole::from($this->role);
    }

    public function setRole(AdminUserRole $role): void
    {
        $this->role = $role->value;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->created_at ?? throw new LogicException('Admin user createdAt is not set.');
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): void
    {
        $this->created_at = $createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updated_at ?? throw new LogicException('Admin user updatedAt is not set.');
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): void
    {
        $this->updated_at = $updatedAt;
    }

    public function getBannedAt(): ?DateTimeImmutable
    {
        return $this->banned_at;
    }

    public function setBannedAt(?DateTimeImmutable $bannedAt): void
    {
        $this->banned_at = $bannedAt;
    }
}
