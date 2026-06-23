import {
    Box,
    Center,
    Collapse,
    Loader,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    UnstyledButton,
} from '@mantine/core'
import { useTimeout } from '@mantine/hooks'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type CSSProperties } from 'react'

import type { MediaLibraryFolderTreeNode } from '@modules/dashboard/models/media-library-api.interface'
import { useMediaLibraryFolderTreeQuery } from '@modules/dashboard/store/media-library-api'
import styles from './styles.module.scss'

export type FolderPickerChangePayload = {
    id: string | null
    path: string
}

type FolderPickerTreeItem = {
    id: string | null
    name: string
    children?: MediaLibraryFolderTreeNode[]
}

type Props = {
    currentFolderId: string | null
    onChangeFolder: (folder: FolderPickerChangePayload) => void
}

const ROOT_FOLDER_PICKER_VALUE = 'root'
const TREE_LOADING_DELAY = 500

export function FolderPicker({ currentFolderId, onChangeFolder }: Props) {
    const mediaLibraryT = useTranslations('Dashboard.MediaLibrary')
    const t = useTranslations('Dashboard.MediaLibrary.EditFile')
    const [draftFolder, setDraftFolder] = useState({
        sourceFolderId: currentFolderId,
        selectedFolderId: currentFolderId,
    })
    const [expandedFolderValues, setExpandedFolderValues] = useState<string[]>([ROOT_FOLDER_PICKER_VALUE])
    const { data: folders = [], isLoading, isFetching } = useMediaLibraryFolderTreeQuery()
    const isFolderTreeLoading = isLoading || isFetching
    const [isTreeLoading, setIsTreeLoading] = useState(isFolderTreeLoading)
    const { start: finishTreeLoading, clear: clearTreeLoadingTimeout } = useTimeout(
        () => setIsTreeLoading(false),
        TREE_LOADING_DELAY
    )
    const rootFolderLabel = mediaLibraryT('rootFolder')
    const selectedFolderId =
        draftFolder.sourceFolderId === currentFolderId ? draftFolder.selectedFolderId : currentFolderId
    const selectedPath = getFolderPickerPath(rootFolderLabel, selectedFolderId, folders)
    const openedFolderValues = new Set(expandedFolderValues)

    useEffect(() => {
        if (isFolderTreeLoading) {
            clearTreeLoadingTimeout()
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsTreeLoading(true)
            return
        }

        finishTreeLoading()
        return clearTreeLoadingTimeout
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFolderTreeLoading])

    const handleSelect = (folderId: string | null) => {
        const path = getFolderPickerPath(rootFolderLabel, folderId, folders)

        setDraftFolder({
            sourceFolderId: currentFolderId,
            selectedFolderId: folderId,
        })
        onChangeFolder({
            id: folderId,
            path,
        })
    }

    const handleToggle = (value: string) => {
        setExpandedFolderValues((currentValues) =>
            currentValues.includes(value)
                ? currentValues.filter((currentValue) => currentValue !== value)
                : [...currentValues, value]
        )
    }

    if (isTreeLoading) {
        return (
            <Box className={styles.folderPicker}>
                <Center className={styles.folderPicker__loader}>
                    <Loader />
                </Center>
            </Box>
        )
    }

    return (
        <Box className={styles.folderPicker}>
            <Stack gap="md">
                <TextInput
                    classNames={{ input: styles.folderPicker__readonlyInput }}
                    label={t('selectedFolderLabel')}
                    readOnly
                    value={selectedPath}
                />

                <ScrollArea.Autosize mah={320} type="auto">
                    <Stack gap={4}>
                        <FolderPickerNode
                            node={{ id: null, name: rootFolderLabel, children: folders }}
                            level={0}
                            selectedFolderId={selectedFolderId}
                            openedFolderValues={openedFolderValues}
                            onSelect={handleSelect}
                            onToggle={handleToggle}
                        />
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Box>
    )
}

function FolderPickerNode({
    node,
    level,
    selectedFolderId,
    openedFolderValues,
    onSelect,
    onToggle,
}: {
    node: FolderPickerTreeItem
    level: number
    selectedFolderId: string | null
    openedFolderValues: Set<string>
    onSelect: (folderId: string | null) => void
    onToggle: (value: string) => void
}) {
    const isSelected = node.id === selectedFolderId
    const value = getFolderPickerValue(node.id)
    const hasChildren = Boolean(node.children?.length)
    const isOpened = openedFolderValues.has(value)

    const handleClick = () => {
        onSelect(node.id)

        if (hasChildren) {
            onToggle(value)
        }
    }

    return (
        <>
            <UnstyledButton
                className={styles.folderPicker__item}
                data-selected={isSelected || undefined}
                data-opened={isOpened || undefined}
                style={{ '--folder-picker-level': level } as CSSProperties}
                onClick={handleClick}
            >
                <span className={styles.folderPicker__chevron} data-hidden={!hasChildren || undefined}>
                    {isOpened ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
                </span>
                <ThemeIcon className={styles.folderPicker__icon} color="indigo" variant="light" radius="md">
                    {node.id === null ? (
                        <FolderOpen size={18} strokeWidth={1.9} />
                    ) : (
                        <Folder size={18} strokeWidth={1.9} />
                    )}
                </ThemeIcon>
                <Text className={styles.folderPicker__name}>{node.name}</Text>
            </UnstyledButton>

            {hasChildren && (
                <Collapse expanded={isOpened}>
                    {node.children?.map((child) => (
                        <FolderPickerNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedFolderId={selectedFolderId}
                            openedFolderValues={openedFolderValues}
                            onSelect={onSelect}
                            onToggle={onToggle}
                        />
                    ))}
                </Collapse>
            )}
        </>
    )
}

function getFolderPickerValue(folderId: string | null): string {
    return folderId ?? ROOT_FOLDER_PICKER_VALUE
}

function getFolderPickerPath(
    rootFolderLabel: string,
    folderId: string | null,
    tree: MediaLibraryFolderTreeNode[]
): string {
    if (!folderId) {
        return rootFolderLabel
    }

    const path = findFolderPickerPath(tree, folderId)

    return path ? [rootFolderLabel, ...path.map((folder) => folder.name)].join(' / ') : rootFolderLabel
}

function findFolderPickerPath(
    tree: MediaLibraryFolderTreeNode[],
    folderId: string
): MediaLibraryFolderTreeNode[] | null {
    for (const node of tree) {
        if (node.id === folderId) {
            return [node]
        }

        const childPath = findFolderPickerPath(node.children, folderId)

        if (childPath) {
            return [node, ...childPath]
        }
    }

    return null
}
