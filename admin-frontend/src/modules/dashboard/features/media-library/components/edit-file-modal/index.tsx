import { Button, Chip, Divider, Group, Modal, SimpleGrid, Stack, Text, TextInput, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Download, FolderOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { MediaLibraryFile } from '@modules/dashboard/models/media-library-api.interface'
import { useChangeMediaLibraryFileMutation } from '@modules/dashboard/store/media-library-api'
import { CopyInput } from '@modules/shared/components/copy-input'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { formatApiDate } from '@modules/shared/helpers/api'
import { formatFileSize } from '@modules/shared/helpers/common'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import { useDownload } from '@modules/shared/hooks/use-download'
import { FolderPicker, type FolderPickerChangePayload } from '../folder-picker'
import styles from './styles.module.scss'

type EditFileFormValues = {
    name: string
    folder: string
    folderId: string
    isPublic: boolean
}

type Props = {
    opened: boolean
    file: MediaLibraryFile | null
    folderPath: string
    onClose: () => void
    reloadFolder: () => unknown
}

const initialValues: EditFileFormValues = {
    name: '',
    folder: '',
    folderId: '',
    isPublic: false,
}

export function EditFileModal({ opened, file, folderPath, onClose, reloadFolder }: Props) {
    const t = useTranslations('Dashboard.MediaLibrary.EditFile')
    const sharedT = useTranslations('Shared.Validation')
    const [isFolderPickerOpened, setIsFolderPickerOpened] = useState(false)
    const [draftFolder, setDraftFolder] = useState<FolderPickerChangePayload | null>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [changeFile, { isLoading: isChanging, error: changeFileError, reset: resetChangeFile }] =
        useChangeMediaLibraryFileMutation()
    const { download, isDownloading } = useDownload()
    const form = useForm<EditFileFormValues>({
        initialValues,
        onValuesChange: () => resetChangeFile(),
        validate: {
            name: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
        },
        transformValues: (values) => ({
            ...values,
            name: values.name.trim(),
        }),
    })
    const formRef = useRef(form)
    const initializedFileIdRef = useRef<string | null>(null)
    const fileId = file?.id
    const fileName = file?.name
    const fileFolderId = file?.folderId
    const fileIsPublic = file?.isPublic
    const isSubmitting = isChanging || isReloading

    useApiFormErrors(form, changeFileError)

    useEffect(() => {
        formRef.current = form
    }, [form])

    useEffect(() => {
        const currentForm = formRef.current

        if (!opened) {
            initializedFileIdRef.current = null
            return
        }

        if (!fileId) {
            initializedFileIdRef.current = null
            currentForm.clearErrors()
            resetChangeFile()
            currentForm.reset()
            return
        }

        if (initializedFileIdRef.current === fileId) {
            return
        }

        const values = {
            name: fileName ?? '',
            folder: folderPath,
            folderId: fileFolderId ?? '',
            isPublic: fileIsPublic ?? false,
        }

        currentForm.clearErrors()
        resetChangeFile()
        currentForm.setValues(values)
        currentForm.resetDirty(values)
        initializedFileIdRef.current = fileId
    }, [fileFolderId, fileId, fileIsPublic, fileName, folderPath, opened, resetChangeFile])

    const handleClose = () => {
        if (isSubmitting) {
            return
        }

        setIsFolderPickerOpened(false)
        setDraftFolder(null)
        resetChangeFile()
        onClose()
    }

    const handleOpenFolderPicker = () => {
        setDraftFolder({
            id: form.values.folderId || null,
            path: form.values.folder,
        })
        setIsFolderPickerOpened(true)
    }

    const handleApplyFolder = () => {
        if (draftFolder) {
            form.setFieldValue('folderId', draftFolder.id ?? '')
            form.setFieldValue('folder', draftFolder.path)
            form.clearFieldError('folder')
            form.clearFieldError('folderId')
        }

        setDraftFolder(null)
        setIsFolderPickerOpened(false)
    }

    const handleCloseFolderPicker = () => {
        if (isSubmitting) {
            return
        }

        setDraftFolder(null)
        setIsFolderPickerOpened(false)
    }

    const handleSubmit = async (values: EditFileFormValues) => {
        if (!file) {
            return
        }

        form.clearErrors()
        resetChangeFile()

        try {
            await changeFile({
                id: file.id,
                folderId: values.folderId || null,
                name: values.name,
                isPublic: values.isPublic,
            }).unwrap()

            setIsReloading(true)
            await reloadFolder()
            setIsReloading(false)
            onClose()
        } catch {
            setIsReloading(false)
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    const handleDownload = () => {
        if (!file) {
            return
        }

        void download(file.publicUrl, file.originalName)
    }

    return (
        <>
            <Modal opened={opened} title={t('title')} onClose={handleClose}>
                <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            autoFocus
                            label={t('nameLabel')}
                            placeholder={t('namePlaceholder')}
                            disabled={!file || isSubmitting}
                            {...form.getInputProps('name')}
                        />

                        <Group className={styles.editFile__folderRow} align="flex-end" gap="sm" wrap="nowrap">
                            <Tooltip
                                classNames={{ tooltip: styles.editFile__folderTooltip }}
                                disabled={!form.values.folder}
                                label={form.values.folder}
                                multiline
                                position="top-start"
                                withinPortal={false}
                                maw={420}
                            >
                                <TextInput
                                    classNames={{
                                        input: `${styles.editFile__readonlyInput} ${styles.editFile__folderInputElement}`,
                                    }}
                                    className={styles.editFile__folderInput}
                                    label={t('folderLabel')}
                                    readOnly
                                    value={form.values.folder}
                                    error={form.errors.folder ?? form.errors.folderId}
                                />
                            </Tooltip>

                            <Button
                                className={styles.editFile__folderButton}
                                variant="default"
                                disabled={!file || isSubmitting}
                                leftSection={<FolderOpen size={17} strokeWidth={1.9} />}
                                onClick={handleOpenFolderPicker}
                            >
                                {t('changeFolder')}
                            </Button>
                        </Group>

                        <Chip
                            checked={form.values.isPublic}
                            disabled={!file}
                            onChange={(checked) => {
                                if (isSubmitting) {
                                    return
                                }

                                form.setFieldValue('isPublic', checked)
                            }}
                        >
                            {t('publicLabel')}
                        </Chip>

                        <Divider />

                        <Stack gap="sm">
                            <Group justify="space-between" gap="sm" wrap="wrap">
                                <Text className={styles.editFile__sectionTitle}>{t('fileInfoTitle')}</Text>

                                <Button
                                    type="button"
                                    variant="light"
                                    disabled={!file}
                                    loading={isDownloading}
                                    leftSection={<Download size={17} strokeWidth={1.9} />}
                                    onClick={handleDownload}
                                >
                                    {t('download')}
                                </Button>
                            </Group>

                            <CopyInput
                                classNames={{ input: styles.editFile__readonlyInput }}
                                label={t('linkLabel')}
                                value={file?.publicUrl ?? ''}
                            />

                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <EditFileMetaItem label={t('originalNameLabel')} value={file?.originalName} />
                                <EditFileMetaItem label={t('extensionLabel')} value={file?.extension} />
                                <EditFileMetaItem
                                    label={t('sizeLabel')}
                                    value={file ? formatFileSize(file.size) : null}
                                />
                                <EditFileMetaItem
                                    label={t('createdAtLabel')}
                                    value={file ? formatApiDate(file.createdAt) : null}
                                />
                            </SimpleGrid>
                        </Stack>

                        <FormRootError error={form.errors.root} />

                        <Group justify="flex-end" gap="sm">
                            <Button variant="default" disabled={isSubmitting} onClick={handleClose}>
                                {t('cancel')}
                            </Button>
                            <Button
                                color="teal"
                                type="submit"
                                loading={isSubmitting}
                                disabled={!file || !form.values.name.trim()}
                            >
                                {t('submit')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={isFolderPickerOpened} title={t('folderSelectTitle')} onClose={handleCloseFolderPicker}>
                <Stack gap="md">
                    <FolderPicker
                        currentFolderId={draftFolder ? draftFolder.id : form.values.folderId || null}
                        onChangeFolder={setDraftFolder}
                    />

                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" disabled={isSubmitting} onClick={handleCloseFolderPicker}>
                            {t('cancel')}
                        </Button>
                        <Button color="teal" disabled={isSubmitting} onClick={handleApplyFolder}>
                            {t('applyFolder')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    )
}

function EditFileMetaItem({
    label,
    value,
    withTooltip = false,
}: {
    label: string
    value: string | null | undefined
    withTooltip?: boolean
}) {
    const content = value || '-'

    return (
        <Stack className={styles.editFile__metaItem} gap={4}>
            <Text className={styles.editFile__metaLabel}>{label}</Text>
            <Tooltip
                classNames={{ tooltip: styles.editFile__metaTooltip }}
                disabled={!withTooltip || !value}
                label={content}
                multiline
                position="top-end"
                withinPortal={false}
                w={280}
            >
                <Text className={styles.editFile__metaValue}>{content}</Text>
            </Tooltip>
        </Stack>
    )
}
