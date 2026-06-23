<?php

declare(strict_types=1);

namespace Common\Infra\Db\Migration;

use Yiisoft\Db\Constant\IndexType;
use Yiisoft\Db\Expression\Expression;
use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M260605000000CreateAdminUsersTable implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $column = $b->columnBuilder();

        $b->createTable('{{%admin_users}}', [
            'id' => $column::uuidPrimaryKey(),
            'email' => $column::string(255)->notNull(),
            'first_name' => $column::string(255)->notNull(),
            'last_name' => $column::string(255),
            'password' => $column::string(255)->notNull(),
            'role' => $column::string(64)->notNull(),
            'created_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
            'updated_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
            'banned_at' => $column::timestamp(),
        ]);
        $b->createIndex('{{%admin_users}}', 'idx_admin_users_email', 'email', IndexType::UNIQUE);
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('{{%admin_users}}');
    }
}
