'use client'

import { Button, Card, Group, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core'
import { useTimeout } from '@mantine/hooks'
import { Folder, FolderPlus, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { DashboardPageHeader } from '@modules/dashboard/components/page-header'
import type {
    MediaLibraryCurrentFolder,
    MediaLibraryFile,
    MediaLibraryFolder,
    MediaLibraryFolderParent,
} from '@modules/dashboard/models/media-library-api.interface'
import { useMediaLibraryFolderContentQuery } from '@modules/dashboard/store/media-library-api'
import { CreateFileModal } from './components/create-file-modal'
import { CreateFolderModal } from './components/create-folder-modal'
import { EditFileModal } from './components/edit-file-modal'
import { EditFolderModal } from './components/edit-folder-modal'
import { FileCard } from './components/file-card'
import { FolderCard } from './components/folder-card'
import styles from './styles.module.scss'

type MediaLibraryRouteParams = {
    folderId?: string
}

const MEDIA_LIBRARY_ROOT_PATH = '/media-library'
const LOADING_CARDS_COUNT = 9

export function MediaLibrary() {
    const t = useTranslations('Dashboard.MediaLibrary')
    const router = useRouter()
    const params = useParams<MediaLibraryRouteParams>()
    const [isCreateFileOpened, setIsCreateFileOpened] = useState(false)
    const [isCreateFolderOpened, setIsCreateFolderOpened] = useState(false)
    const [editFile, setEditFile] = useState<MediaLibraryFile | null>(null)
    const [editFolder, setEditFolder] = useState<MediaLibraryFolder | null>(null)
    const currentFolderId = params.folderId

    const {
        currentData: folderContent,
        // use loading instead of is fetching to avoid loading after folder/file add
        isLoading: isCurrentFolderLoading,
        refetch: reloadFolderContent,
    } = useMediaLibraryFolderContentQuery(currentFolderId ? { parentId: currentFolderId } : undefined)
    const [isContentLoading, setIsContentLoading] = useState(isCurrentFolderLoading)
    const { start: finishContentLoading, clear: clearContentLoadingTimeout } = useTimeout(
        () => setIsContentLoading(false),
        500
    )
    const folders = folderContent?.folders ?? []
    const files = folderContent?.files ?? []
    const currentFolder = folderContent?.currentFolder ?? null
    const breadcrumbs = getBreadcrumbs(folderContent)
    const currentFolderPath = getFolderPath(t('rootFolder'), breadcrumbs)

    useEffect(() => {
        if (isCurrentFolderLoading) {
            clearContentLoadingTimeout()
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsContentLoading(true)
            return
        }

        finishContentLoading()
        return clearContentLoadingTimeout
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCurrentFolderLoading])

    const openFolder = (folderId: string | null) => {
        router.push(getMediaLibraryPath(folderId))
    }

    function content() {
        if (isContentLoading) {
            return <MediaLibraryLoading />
        }

        if (folders.length === 0 && files.length === 0) {
            return <MediaLibraryEmpty />
        }

        return (
            <div className={styles.mediaLibrary__grid}>
                {folders.map((folder) => (
                    <FolderCard
                        key={folder.id}
                        folder={folder}
                        onOpen={() => openFolder(folder.id)}
                        onEdit={() => setEditFolder(folder)}
                        reloadFolder={reloadFolderContent}
                    />
                ))}

                {files.map((file) => (
                    <FileCard
                        key={file.id}
                        file={file}
                        onEdit={() => setEditFile(file)}
                        reloadFolder={reloadFolderContent}
                    />
                ))}
            </div>
        )
    }

    return (
        <Stack className={styles.mediaLibrary} gap="xl">
            <DashboardPageHeader
                title={t('title')}
                breadcrumbs={[
                    {
                        key: 'root',
                        label: t('rootFolder'),
                        disabled: isContentLoading || !currentFolderId,
                        onClick: () => openFolder(null),
                    },
                    ...breadcrumbs.map((folder) => ({
                        key: folder.id,
                        label: folder.name,
                        disabled: isContentLoading || folder.id === currentFolderId,
                        onClick: () => openFolder(folder.id),
                    })),
                ]}
                actions={
                    <Group className={styles.mediaLibrary__actions} gap="sm" wrap="wrap">
                        <Button
                            className={styles.mediaLibrary__action}
                            disabled={isContentLoading}
                            leftSection={<Upload size={18} strokeWidth={1.9} />}
                            onClick={() => setIsCreateFileOpened(true)}
                        >
                            {t('Actions.upload')}
                        </Button>

                        <Button
                            className={styles.mediaLibrary__action}
                            color="teal"
                            disabled={isContentLoading}
                            leftSection={<FolderPlus size={18} strokeWidth={1.9} />}
                            onClick={() => setIsCreateFolderOpened(true)}
                        >
                            {t('Actions.createFolder')}
                        </Button>
                    </Group>
                }
            />

            {content()}

            <CreateFolderModal
                opened={isCreateFolderOpened}
                currentFolder={currentFolderId}
                onClose={() => setIsCreateFolderOpened(false)}
                reloadFolder={reloadFolderContent}
            />

            <CreateFileModal
                opened={isCreateFileOpened}
                currentFolder={currentFolder}
                folderPath={currentFolderPath}
                onClose={() => setIsCreateFileOpened(false)}
                reloadFolder={reloadFolderContent}
            />

            <EditFolderModal
                opened={Boolean(editFolder)}
                folder={editFolder}
                onClose={() => setEditFolder(null)}
                reloadFolder={reloadFolderContent}
            />

            <EditFileModal
                opened={Boolean(editFile)}
                file={editFile}
                folderPath={currentFolderPath}
                onClose={() => setEditFile(null)}
                reloadFolder={reloadFolderContent}
            />
        </Stack>
    )
}

function MediaLibraryEmpty() {
    const t = useTranslations('Dashboard.MediaLibrary')

    return (
        <Card className={styles.empty} radius="md" padding="xl" withBorder>
            <ThemeIcon color="gray" variant="light" radius="md" size={44}>
                <Folder size={22} strokeWidth={1.9} />
            </ThemeIcon>
            <Text className={styles.empty__title}>{t('emptyTitle')}</Text>
        </Card>
    )
}

function MediaLibraryLoading() {
    const t = useTranslations('Dashboard.MediaLibrary')

    return (
        <div className={styles.mediaLibrary__grid} aria-label={t('loadingTitle')}>
            {Array.from({ length: LOADING_CARDS_COUNT }).map((_, index) => (
                <Card key={index} className={styles.loadingCard} radius="md" padding="md" withBorder>
                    <Group align="center" gap="sm" wrap="nowrap">
                        <Skeleton circle height={44} width={44} />
                        <Stack className={styles.loadingCard__text} gap={8}>
                            <Skeleton height={16} radius="xl" width="70%" />
                            <Skeleton height={13} radius="xl" width="45%" />
                        </Stack>
                    </Group>
                </Card>
            ))}
        </div>
    )
}

function getMediaLibraryPath(folderId: string | null): string {
    if (!folderId) {
        return MEDIA_LIBRARY_ROOT_PATH
    }

    return `${MEDIA_LIBRARY_ROOT_PATH}/${encodeURIComponent(folderId)}`
}

function getBreadcrumbs(
    folderContent:
        | {
              parents: MediaLibraryFolderParent[]
              currentFolder: MediaLibraryCurrentFolder | null
          }
        | undefined
): Array<MediaLibraryFolderParent | MediaLibraryCurrentFolder> {
    if (!folderContent?.currentFolder) {
        return folderContent?.parents ?? []
    }

    return [...folderContent.parents, folderContent.currentFolder]
}

function getFolderPath(
    rootFolderLabel: string,
    breadcrumbs: Array<MediaLibraryFolderParent | MediaLibraryCurrentFolder>
): string {
    return [rootFolderLabel, ...breadcrumbs.map((folder) => folder.name)].join(' / ')
}
