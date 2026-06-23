<?php

declare(strict_types=1);

namespace Common\Infra\Db\Migration;

use Yiisoft\Db\Expression\Expression;
use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M260618010000CreateAdminMediaFilesTable implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $column = $b->columnBuilder();

        $b->createTable('{{%admin_media_files}}', [
            'id' => $column::uuidPrimaryKey(),
            'folder_id' => $column::uuid(),
            'storage_key' => $column::string(512)->notNull(),
            'original_name' => $column::string(255)->notNull(),
            'name' => $column::string(255)->notNull(),
            'extension' => $column::string(32)->notNull(),
            'mime_type' => $column::string(255)->notNull(),
            'size' => $column::bigint()->notNull(),
            'checksum' => $column::string(128)->notNull(),
            'is_public' => $column::boolean()->notNull()->defaultValue(false),
            'created_by' => $column::uuid()->notNull(),
            'created_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
            'updated_at' => $column::timestamp()->notNull()->defaultValue(new Expression('CURRENT_TIMESTAMP')),
        ]);

        $b->addForeignKey(
            '{{%admin_media_files}}',
            'fk_admin_media_files_folder_id',
            'folder_id',
            '{{%admin_media_folders}}',
            'id',
            'SET NULL',
        );

        $b->addForeignKey(
            '{{%admin_media_files}}',
            'fk_admin_media_files_created_by',
            'created_by',
            '{{%admin_users}}',
            'id',
            'SET NULL',
        );
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropForeignKey('{{%admin_media_files}}', 'fk_admin_media_files_created_by');
        $b->dropForeignKey('{{%admin_media_files}}', 'fk_admin_media_files_folder_id');
        $b->dropTable('{{%admin_media_files}}');
    }
}
