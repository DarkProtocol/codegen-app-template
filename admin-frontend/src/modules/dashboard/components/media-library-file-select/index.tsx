'use client'

import {
    Breadcrumbs,
    Checkbox,
    Group,
    Input,
    Popover,
    ScrollArea,
    Skeleton,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
} from '@mantine/core'
import { useTimeout } from '@mantine/hooks'
import {
    Check,
    ChevronDown,
    ChevronRight,
    File as FileIcon,
    FileText,
    Folder,
    FolderOpen,
    Image,
    Music,
    Search,
    Video,
    X,
    type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import type {
    MediaLibraryCurrentFolder,
    MediaLibraryFile,
    MediaLibraryFolder,
    MediaLibraryFolderParent,
    MediaLibraryFolderTreeNode,
} from '@modules/dashboard/models/media-library-api.interface'
import {
    useMediaLibraryFolderContentQuery,
    useMediaLibraryFolderTreeQuery,
} from '@modules/dashboard/store/media-library-api'
import { formatFileSize, getFileTypeByMime } from '@modules/shared/helpers/common'
import styles from './styles.module.scss'

const fileTypeIcons: Record<ReturnType<typeof getFileTypeByMime>, LucideIcon> = {
    image: Image,
    video: Video,
    audio: Music,
    pdf: FileText,
    file: FileIcon,
}

const EMPTY_FOLDERS: MediaLibraryFolder[] = []
const EMPTY_FILES: MediaLibraryFile[] = []
const EMPTY_FOLDER_TREE: MediaLibraryFolderTreeNode[] = []
const CONTENT_LOADING_DELAY = 500

export type MediaLibraryFileSelectProps = {
    value: MediaLibraryFile[]
    onChange: (files: MediaLibraryFile[]) => void
    allowedExtensions?: string[]
    multiple?: boolean
    label?: ReactNode
    placeholder?: string
    disabled?: boolean
    error?: ReactNode
}

export function MediaLibraryFileSelect({
    value,
    onChange,
    allowedExtensions,
    multiple = false,
    label,
    placeholder,
    disabled = false,
    error,
}: MediaLibraryFileSelectProps) {
    const mediaLibraryT = useTranslations('Dashboard.MediaLibrary')
    const t = useTranslations('Dashboard.MediaLibrary.FileSelect')
    const [opened, setOpened] = useState(false)
    const [search, setSearch] = useState('')
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const { currentData: folderContent, isLoading } = useMediaLibraryFolderContentQuery(
        currentFolderId ? { parentId: currentFolderId } : undefined,
        {
            skip: !opened,
        }
    )
    const { data: folderTree = EMPTY_FOLDER_TREE } = useMediaLibraryFolderTreeQuery(undefined, {
        skip: !opened,
    })
    const isRealContentLoading = opened && (isLoading || !folderContent)
    const [isContentLoading, setIsContentLoading] = useState(false)
    const { start: finishContentLoading, clear: clearContentLoadingTimeout } = useTimeout(
        () => setIsContentLoading(false),
        CONTENT_LOADING_DELAY
    )
    const allowedExtensionsSet = useMemo(() => normalizeExtensions(allowedExtensions), [allowedExtensions])
    const selectedIdsSet = useMemo(() => new Set(value.map((file) => file.id)), [value])
    const normalizedSearch = search.trim().toLowerCase()
    const folders = folderContent?.folders ?? EMPTY_FOLDERS
    const files = folderContent?.files ?? EMPTY_FILES
    const filteredFolders = useMemo(
        () => filterItemsBySearch(folders, normalizedSearch, (folder) => [folder.name]),
        [folders, normalizedSearch]
    )
    const filteredFiles = useMemo(
        () => filterItemsBySearch(files, normalizedSearch, (file) => [file.name, file.originalName, file.extension]),
        [files, normalizedSearch]
    )
    const highlightedFolderIds = useMemo(() => getHighlightedFolderIds(folderTree, value), [folderTree, value])
    const breadcrumbs = getBreadcrumbs(folderContent)
    const resolvedPlaceholder = placeholder ?? (multiple ? t('multiplePlaceholder') : t('placeholder'))
    const targetLabel = getTargetLabel(value, resolvedPlaceholder)
    const hasSelection = value.length > 0

    useEffect(() => {
        if (!opened) {
            clearContentLoadingTimeout()
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsContentLoading(false)
            return
        }

        if (isRealContentLoading) {
            clearContentLoadingTimeout()
            setIsContentLoading(true)
            return
        }

        finishContentLoading()
        return clearContentLoadingTimeout
    }, [opened, isRealContentLoading, clearContentLoadingTimeout, finishContentLoading])

    const handleOpenChange = (nextOpened: boolean) => {
        if (disabled) {
            setOpened(false)
            return
        }

        setOpened(nextOpened)
    }

    const handleNavigate = (folderId: string | null) => {
        setCurrentFolderId(folderId)
        setSearch('')
    }

    const handleSelectFile = (file: MediaLibraryFile) => {
        if (!isFileAllowed(file, allowedExtensionsSet)) {
            return
        }

        if (!multiple) {
            onChange([file])
            setOpened(false)
            return
        }

        onChange(
            selectedIdsSet.has(file.id) ? value.filter((selectedFile) => selectedFile.id !== file.id) : [...value, file]
        )
    }

    const handleClearClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation()
        onChange([])
    }

    const handleClearKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return
        }

        event.preventDefault()
        event.stopPropagation()
        onChange([])
    }

    return (
        <Input.Wrapper className={styles.mediaLibraryFileSelect__wrapper} label={label} error={error}>
            <Popover opened={opened} width="target" position="bottom-start" shadow="md" onChange={handleOpenChange}>
                <Popover.Target>
                    <Input
                        component="button"
                        type="button"
                        size="md"
                        pointer
                        className={styles.mediaLibraryFileSelect__target}
                        data-error={Boolean(error) || undefined}
                        data-placeholder={!hasSelection || undefined}
                        disabled={disabled}
                        error={error}
                        rightSectionPointerEvents="all"
                        rightSection={
                            <Group className={styles.mediaLibraryFileSelect__targetActions} gap={4} wrap="nowrap">
                                {hasSelection && (
                                    <span
                                        className={styles.mediaLibraryFileSelect__clear}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={t('clear')}
                                        onClick={handleClearClick}
                                        onKeyDown={handleClearKeyDown}
                                    >
                                        <X size={15} strokeWidth={2} />
                                    </span>
                                )}
                                <ChevronDown size={16} strokeWidth={2} />
                            </Group>
                        }
                        rightSectionWidth={hasSelection ? 60 : 38}
                        onClick={() => handleOpenChange(!opened)}
                    >
                        <Tooltip label={targetLabel} disabled={!hasSelection} multiline>
                            <span className={styles.mediaLibraryFileSelect__targetText}>{targetLabel}</span>
                        </Tooltip>
                    </Input>
                </Popover.Target>

                <Popover.Dropdown className={styles.mediaLibraryFileSelect__dropdown}>
                    {isContentLoading ? (
                        <MediaLibraryFileSelectLoading />
                    ) : (
                        <Stack gap="sm">
                            <MediaLibraryFileSelectBreadcrumbs
                                currentFolderId={currentFolderId}
                                rootFolderLabel={mediaLibraryT('rootFolder')}
                                breadcrumbs={breadcrumbs}
                                onNavigate={handleNavigate}
                            />

                            <TextInput
                                leftSection={<Search size={16} strokeWidth={1.9} />}
                                placeholder={t('searchPlaceholder')}
                                value={search}
                                onChange={(event) => setSearch(event.currentTarget.value)}
                            />

                            <ScrollArea.Autosize
                                classNames={{
                                    content: styles.mediaLibraryFileSelect__scrollContent,
                                    viewport: styles.mediaLibraryFileSelect__scrollViewport,
                                }}
                                mah={300}
                                scrollbars="y"
                                type="hover"
                            >
                                <Stack className={styles.mediaLibraryFileSelect__list} gap={4}>
                                    {filteredFolders.map((folder) => (
                                        <MediaLibraryFileSelectFolderOption
                                            key={folder.id}
                                            folder={folder}
                                            highlighted={highlightedFolderIds.has(folder.id)}
                                            meta={mediaLibraryT('folderItems', {
                                                count: folder.foldersCount + folder.filesCount,
                                            })}
                                            onClick={() => handleNavigate(folder.id)}
                                        />
                                    ))}

                                    {filteredFiles.map((file) => (
                                        <MediaLibraryFileSelectFileOption
                                            key={file.id}
                                            file={file}
                                            disabled={!isFileAllowed(file, allowedExtensionsSet)}
                                            multiple={multiple}
                                            selected={selectedIdsSet.has(file.id)}
                                            onClick={() => handleSelectFile(file)}
                                        />
                                    ))}

                                    {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                                        <Text className={styles.mediaLibraryFileSelect__empty}>{t('empty')}</Text>
                                    )}
                                </Stack>
                            </ScrollArea.Autosize>
                        </Stack>
                    )}
                </Popover.Dropdown>
            </Popover>
        </Input.Wrapper>
    )
}

function MediaLibraryFileSelectLoading() {
    return (
        <Stack gap="sm">
            <Skeleton height={18} radius="xl" width="55%" />
            <Skeleton height={36} radius="sm" />

            <Stack gap={4}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Group key={index} className={styles.mediaLibraryFileSelect__loadingOption} gap={10} wrap="nowrap">
                        <Skeleton height={34} radius="md" width={34} />
                        <Stack className={styles.mediaLibraryFileSelect__loadingText} gap={6}>
                            <Skeleton height={14} radius="xl" width="72%" />
                            <Skeleton height={12} radius="xl" width="42%" />
                        </Stack>
                    </Group>
                ))}
            </Stack>
        </Stack>
    )
}

function MediaLibraryFileSelectBreadcrumbs({
    currentFolderId,
    rootFolderLabel,
    breadcrumbs,
    onNavigate,
}: {
    currentFolderId: string | null
    rootFolderLabel: string
    breadcrumbs: Array<MediaLibraryFolderParent | MediaLibraryCurrentFolder>
    onNavigate: (folderId: string | null) => void
}) {
    return (
        <Breadcrumbs className={styles.mediaLibraryFileSelect__breadcrumbs} separator={<ChevronRight size={14} />}>
            <UnstyledButton
                className={styles.mediaLibraryFileSelect__breadcrumb}
                disabled={!currentFolderId}
                onClick={() => onNavigate(null)}
            >
                {rootFolderLabel}
            </UnstyledButton>

            {breadcrumbs.map((folder) => (
                <UnstyledButton
                    key={folder.id}
                    className={styles.mediaLibraryFileSelect__breadcrumb}
                    disabled={folder.id === currentFolderId}
                    onClick={() => onNavigate(folder.id)}
                >
                    {folder.name}
                </UnstyledButton>
            ))}
        </Breadcrumbs>
    )
}

function MediaLibraryFileSelectFolderOption({
    folder,
    meta,
    highlighted,
    onClick,
}: {
    folder: MediaLibraryFolder
    meta: string
    highlighted: boolean
    onClick: () => void
}) {
    return (
        <UnstyledButton
            className={styles.mediaLibraryFileSelect__option}
            data-highlighted={highlighted || undefined}
            onClick={onClick}
        >
            <ThemeIcon className={styles.mediaLibraryFileSelect__optionIcon} color="indigo" variant="light" radius="md">
                {folder.foldersCount > 0 ? (
                    <FolderOpen size={18} strokeWidth={1.9} />
                ) : (
                    <Folder size={18} strokeWidth={1.9} />
                )}
            </ThemeIcon>

            <Stack className={styles.mediaLibraryFileSelect__optionText} gap={2}>
                <Text className={styles.mediaLibraryFileSelect__optionName}>{folder.name}</Text>
                <Text className={styles.mediaLibraryFileSelect__optionMeta}>{meta}</Text>
            </Stack>

            <Group className={styles.mediaLibraryFileSelect__folderStatus} gap={6} wrap="nowrap">
                {highlighted && <Check size={16} strokeWidth={2.2} />}
                <ChevronRight size={18} strokeWidth={2} />
            </Group>
        </UnstyledButton>
    )
}

function MediaLibraryFileSelectFileOption({
    file,
    disabled,
    multiple,
    selected,
    onClick,
}: {
    file: MediaLibraryFile
    disabled: boolean
    multiple: boolean
    selected: boolean
    onClick: () => void
}) {
    const Icon = fileTypeIcons[getFileTypeByMime(file.mimeType, file.extension)]

    return (
        <UnstyledButton
            className={styles.mediaLibraryFileSelect__option}
            disabled={disabled}
            data-disabled={disabled || undefined}
            data-selected={selected || undefined}
            onClick={onClick}
        >
            <ThemeIcon className={styles.mediaLibraryFileSelect__optionIcon} color="teal" variant="light" radius="md">
                <Icon size={18} strokeWidth={1.9} />
            </ThemeIcon>

            <Stack className={styles.mediaLibraryFileSelect__optionText} gap={2}>
                <Text className={styles.mediaLibraryFileSelect__optionName}>{file.name}</Text>
                <Text className={styles.mediaLibraryFileSelect__optionMeta}>
                    {file.extension.toUpperCase()} · {formatFileSize(file.size)}
                </Text>
            </Stack>

            {multiple ? (
                <Checkbox
                    className={styles.mediaLibraryFileSelect__checkbox}
                    checked={selected}
                    disabled={disabled}
                    readOnly
                />
            ) : (
                selected && <Check className={styles.mediaLibraryFileSelect__check} size={18} strokeWidth={2.2} />
            )}
        </UnstyledButton>
    )
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

function filterItemsBySearch<T>(items: T[], normalizedSearch: string, getValues: (item: T) => string[]): T[] {
    if (!normalizedSearch) {
        return items
    }

    return items.filter((item) => getValues(item).some((value) => value.toLowerCase().includes(normalizedSearch)))
}

function normalizeExtensions(extensions: string[] | undefined): Set<string> | null {
    if (!extensions || extensions.length === 0) {
        return null
    }

    return new Set(
        extensions
            .map((extension) => extension.trim().replace(/^\./, '').toLowerCase())
            .filter((extension) => extension.length > 0)
    )
}

function isFileAllowed(file: MediaLibraryFile, allowedExtensions: Set<string> | null): boolean {
    if (!allowedExtensions) {
        return true
    }

    return allowedExtensions.has(file.extension.toLowerCase())
}

function getHighlightedFolderIds(tree: MediaLibraryFolderTreeNode[], selectedFiles: MediaLibraryFile[]): Set<string> {
    const selectedFolderIds = selectedFiles.map((file) => file.folderId).filter(isString)
    const highlightedFolderIds = new Set<string>()

    selectedFolderIds.forEach((folderId) => {
        const path = findFolderPath(tree, folderId)

        if (!path) {
            highlightedFolderIds.add(folderId)
            return
        }

        path.forEach((folder) => highlightedFolderIds.add(folder.id))
    })

    return highlightedFolderIds
}

function findFolderPath(tree: MediaLibraryFolderTreeNode[], folderId: string): MediaLibraryFolderTreeNode[] | null {
    for (const folder of tree) {
        if (folder.id === folderId) {
            return [folder]
        }

        const childPath = findFolderPath(folder.children, folderId)

        if (childPath) {
            return [folder, ...childPath]
        }
    }

    return null
}

function isString(value: string | null): value is string {
    return typeof value === 'string'
}

function getTargetLabel(selectedFiles: MediaLibraryFile[], placeholder: string): string {
    if (selectedFiles.length === 0) {
        return placeholder
    }

    return selectedFiles.map((file) => file.name).join(', ')
}
