<?php

declare(strict_types=1);

namespace Common\Infra\Db\Migration;

use Yiisoft\Db\Expression\Expression;
use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M260618000000CreateAdminMediaFoldersTable implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $column = $b->columnBuilder();

        $b->createTable('{{%admin_media_folders}}', [
            'id' => $column::uuidPrimaryKey(),
            'parent_id' => $column::uuid(),
            'name' => $column::string(255)->notNull(),
            'created_by' => $column::uuid(),
            'created_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
            'updated_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
        ]);

        $b->addForeignKey(
            '{{%admin_media_folders}}',
            'fk_admin_media_folders_parent_id',
            'parent_id',
            '{{%admin_media_folders}}',
            'id',
            'SET NULL',
        );

        $b->addForeignKey(
            '{{%admin_media_folders}}',
            'fk_admin_media_folders_created_by',
            'created_by',
            '{{%admin_users}}',
            'id',
            'SET NULL',
        );
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropForeignKey('{{%admin_media_folders}}', 'fk_admin_media_folders_created_by');
        $b->dropForeignKey('{{%admin_media_folders}}', 'fk_admin_media_folders_parent_id');
        $b->dropTable('{{%admin_media_folders}}');
    }
}
