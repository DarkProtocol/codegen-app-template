import { ActionIcon, Card, Group, Stack, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { File as FileIcon, FileText, Image, Music, Pencil, Trash2, Video, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { MediaLibraryFile } from '@modules/dashboard/models/media-library-api.interface'
import { useDeleteMediaLibraryFileMutation } from '@modules/dashboard/store/media-library-api'
import { ConfirmModal } from '@modules/shared/components/confirm-modal'
import { formatApiDate, getApiFirstErrorMessage } from '@modules/shared/helpers/api'
import { formatFileSize, getFileTypeByMime } from '@modules/shared/helpers/common'
import styles from './styles.module.scss'

const FILE_NAME_TOOLTIP_MIN_LENGTH = 20

const fileTypeIcons: Record<ReturnType<typeof getFileTypeByMime>, LucideIcon> = {
    image: Image,
    video: Video,
    audio: Music,
    pdf: FileText,
    file: FileIcon,
}

type Props = {
    file: MediaLibraryFile
    onEdit: () => void
    reloadFolder: () => unknown
}

export function FileCard({ file, onEdit, reloadFolder }: Props) {
    const t = useTranslations('Dashboard.MediaLibrary')
    const notificationT = useTranslations('Shared.Notification')
    const [isDeleteConfirmOpened, setIsDeleteConfirmOpened] = useState(false)
    const [isReloading, setIsReloading] = useState(false)
    const [deleteFile, { isLoading: isDeleting }] = useDeleteMediaLibraryFileMutation()
    const Icon = fileTypeIcons[getFileTypeByMime(file.mimeType, file.extension)]
    const shouldShowTooltip = file.name.length >= FILE_NAME_TOOLTIP_MIN_LENGTH
    const isDeleteLoading = isDeleting || isReloading

    const handleCloseDeleteConfirm = () => {
        if (isDeleteLoading) {
            return
        }

        setIsDeleteConfirmOpened(false)
    }

    const handleDelete = async () => {
        try {
            await deleteFile({ id: file.id }).unwrap()

            setIsReloading(true)
            await reloadFolder()
            setIsReloading(false)
            setIsDeleteConfirmOpened(false)
        } catch (error) {
            setIsReloading(false)
            const errorMessage = getApiFirstErrorMessage(error, 'id')

            notifications.show({
                color: 'red',
                title: t('DeleteFile.errorTitle'),
                message: errorMessage ?? notificationT('internalErrorMessage'),
            })
        }
    }

    return (
        <>
            <Card className={styles.fileCard} radius="md" padding="md" withBorder>
                <Group align="flex-start" justify="space-between" gap="sm" wrap="nowrap">
                    <UnstyledButton className={styles.fileCard__main} onClick={onEdit}>
                        <ThemeIcon className={styles.fileCard__icon} color="teal" variant="light" radius="md" size={44}>
                            <Icon size={23} strokeWidth={1.9} />
                        </ThemeIcon>
                        <Stack className={styles.fileCard__text} gap={4}>
                            <Tooltip label={file.name} disabled={!shouldShowTooltip}>
                                <Text className={styles.fileCard__name}>{file.name}</Text>
                            </Tooltip>
                            <Text className={styles.fileCard__meta}>
                                {formatFileSize(file.size)} · {formatApiDate(file.createdAt)}
                            </Text>
                        </Stack>
                    </UnstyledButton>

                    <Group className={styles.fileCard__actions} gap={6} wrap="nowrap">
                        <Tooltip label={t('Actions.editFile')}>
                            <ActionIcon
                                color="indigo"
                                variant="light"
                                radius="md"
                                aria-label={t('Actions.editFile')}
                                onClick={onEdit}
                            >
                                <Pencil size={17} strokeWidth={1.9} />
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label={t('Actions.deleteFile')}>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                radius="md"
                                aria-label={t('Actions.deleteFile')}
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
                title={t('DeleteFile.title')}
                message={t('DeleteFile.message', { name: file.name })}
                confirmLabel={t('DeleteFile.confirm')}
                confirmColor="red"
                loading={isDeleteLoading}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDelete}
            />
        </>
    )
}
