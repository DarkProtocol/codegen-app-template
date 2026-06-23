import { ActionIcon, Card, Group, Stack, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Folder, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { MediaLibraryFolder } from '@modules/dashboard/models/media-library-api.interface'
import { useDeleteMediaLibraryFolderMutation } from '@modules/dashboard/store/media-library-api'
import { ConfirmModal } from '@modules/shared/components/confirm-modal'
import { getApiFirstErrorMessage } from '@modules/shared/helpers/api'
import styles from './styles.module.scss'

type Props = {
    folder: MediaLibraryFolder
    onOpen: () => void
    onEdit: () => void
    reloadFolder: () => unknown
}

export function FolderCard({ folder, onOpen, onEdit, reloadFolder }: Props) {
    const t = useTranslations('Dashboard.MediaLibrary')
    const notificationT = useTranslations('Shared.Notification')
    const [isDeleteConfirmOpened, setIsDeleteConfirmOpened] = useState(false)
    const [isReloading, setIsReloading] = useState(false)
    const [deleteFolder, { isLoading: isDeleting }] = useDeleteMediaLibraryFolderMutation()
    const itemsCount = folder.foldersCount + folder.filesCount
    const isDeleteLoading = isDeleting || isReloading

    const handleCloseDeleteConfirm = () => {
        if (isDeleteLoading) {
            return
        }

        setIsDeleteConfirmOpened(false)
    }

    const handleDelete = async () => {
        try {
            await deleteFolder({ id: folder.id }).unwrap()

            setIsReloading(true)
            await reloadFolder()
            setIsReloading(false)
            setIsDeleteConfirmOpened(false)
        } catch (error) {
            setIsReloading(false)
            const errorMessage = getApiFirstErrorMessage(error, 'id')

            notifications.show({
                color: 'red',
                title: t('DeleteFolder.errorTitle'),
                message: errorMessage ?? notificationT('internalErrorMessage'),
            })
        }
    }

    return (
        <>
            <Card className={styles.folderCard} radius="md" padding="md" withBorder>
                <Group align="flex-start" justify="space-between" gap="sm" wrap="nowrap">
                    <UnstyledButton className={styles.folderCard__main} onClick={onOpen}>
                        <ThemeIcon
                            className={styles.folderCard__icon}
                            color="indigo"
                            variant="light"
                            radius="md"
                            size={44}
                        >
                            <Folder size={23} strokeWidth={1.9} />
                        </ThemeIcon>
                        <Stack className={styles.folderCard__text} gap={4}>
                            <Text className={styles.folderCard__name}>{folder.name}</Text>
                            <Text className={styles.folderCard__meta}>{t('folderItems', { count: itemsCount })}</Text>
                        </Stack>
                    </UnstyledButton>

                    <Group className={styles.folderCard__actions} gap={6} wrap="nowrap">
                        <Tooltip label={t('Actions.editFolder')}>
                            <ActionIcon
                                color="indigo"
                                variant="light"
                                radius="md"
                                aria-label={t('Actions.editFolder')}
                                onClick={onEdit}
                            >
                                <Pencil size={17} strokeWidth={1.9} />
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label={t('Actions.deleteFolder')}>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                radius="md"
                                aria-label={t('Actions.deleteFolder')}
                                onClick={() => setIsDeleteConfirmOpened(true)}
                            >
                                <Trash2 size={18} strokeWidth={1.9} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Card>

            <ConfirmModal
                opened={isDeleteConfirmOpened}
                title={t('DeleteFolder.title')}
                message={t('DeleteFolder.message', { name: folder.name })}
                confirmLabel={t('DeleteFolder.confirm')}
                confirmColor="red"
                loading={isDeleteLoading}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDelete}
            />
        </>
    )
}
