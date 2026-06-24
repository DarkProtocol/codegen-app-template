import { Button, Chip, Group, Modal, Stack, Text, TextInput, Tooltip } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import { Check, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { MediaLibraryCurrentFolder } from '@modules/dashboard/models/media-library-api.interface'
import {
    useCreateMediaLibraryFileMutation,
    useMediaLibraryConfigQuery,
} from '@modules/dashboard/store/media-library-api'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { formatFileSize } from '@modules/shared/helpers/common'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import styles from './styles.module.scss'

type CreateFileFormValues = {
    name: string
    folder: string
    folderId: string
    file: File | null
    isPublic: boolean
}

const initialValues: CreateFileFormValues = {
    name: '',
    folder: '',
    folderId: '',
    file: null,
    isPublic: false,
}

type Props = {
    opened: boolean
    currentFolder: MediaLibraryCurrentFolder | null
    folderPath: string
    onClose: () => void
    reloadFolder: () => unknown
}

export function CreateFileModal({ opened, currentFolder, folderPath, onClose, reloadFolder }: Props) {
    const mediaLibraryT = useTranslations('Dashboard.MediaLibrary')
    const t = useTranslations('Dashboard.MediaLibrary.CreateFile')
    const sharedT = useTranslations('Shared.Validation')
    const [isReloading, setIsReloading] = useState(false)
    const { data: config, isLoading: isConfigLoading } = useMediaLibraryConfigQuery()
    const [createFile, { isLoading: isCreating, error: createFileError, reset: resetCreateFile }] =
        useCreateMediaLibraryFileMutation()
    const supportedExtensions = getSupportedExtensions(config?.supportedExtensions)
    const form = useForm<CreateFileFormValues>({
        initialValues,
        onValuesChange: () => resetCreateFile(),
        validate: {
            name: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
            file: (file) => getFileValidationError(file, config?.maxFileSize, t),
        },
        transformValues: (values) => ({
            ...values,
            name: values.name.trim(),
        }),
    })
    const formRef = useRef(form)
    const folderId = currentFolder?.id ?? ''
    const selectedFile = form.values.file
    const isConfigReady = supportedExtensions.length > 0
    const isSubmitting = isCreating || isReloading
    const isFormDisabled = isSubmitting || isConfigLoading || !isConfigReady

    useApiFormErrors(form, createFileError)

    useEffect(() => {
        formRef.current = form
    }, [form])

    useEffect(() => {
        const currentForm = formRef.current
        const values = {
            folder: folderPath,
            folderId,
        }

        currentForm.setValues(values)
        currentForm.clearFieldError('folder')
        currentForm.clearFieldError('folderId')
    }, [folderId, folderPath, opened])

    const handleClose = () => {
        if (isSubmitting) {
            return
        }

        form.reset()
        resetCreateFile()
        onClose()
    }

    const handleDrop = (files: File[]) => {
        if (!isConfigReady) {
            return
        }

        const file = files[0] ?? null
        const fileError = getFileValidationError(file, config?.maxFileSize, t)

        if (fileError) {
            form.setFieldValue('file', null)
            form.setFieldError('file', fileError)
            return
        }

        form.setFieldValue('file', file)
        form.clearFieldError('file')

        if (file && !form.values.name.trim()) {
            form.setFieldValue('name', file.name)
        }
    }

    const handleReject = (rejections: Array<{ file: File }>) => {
        if (!isConfigReady) {
            return
        }

        const file = rejections[0]?.file ?? null
        form.setFieldError('file', getFileRejectError(file, supportedExtensions, config?.maxFileSize, t))
    }

    const handleSubmit = async (values: CreateFileFormValues) => {
        form.clearErrors()
        resetCreateFile()

        if (!isConfigReady) {
            form.setFieldError('file', t('configLoading'))
            return
        }

        if (!values.file) {
            form.setFieldError('file', t('fileRequired'))
            return
        }

        try {
            await createFile({
                folderId: currentFolder?.id ?? null,
                name: values.name,
                file: values.file,
                isPublic: values.isPublic,
            }).unwrap()

            setIsReloading(true)
            await reloadFolder()
            setIsReloading(false)
            form.reset()
            onClose()
        } catch {
            setIsReloading(false)
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    return (
        <Modal opened={opened} title={mediaLibraryT('Actions.upload')} onClose={handleClose}>
            <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        autoFocus
                        label={t('nameLabel')}
                        placeholder={t('namePlaceholder')}
                        disabled={isFormDisabled}
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        classNames={{ input: styles.createFile__folderInput }}
                        label={t('folderLabel')}
                        disabled
                        value={form.values.folder}
                        error={form.errors.folder ?? form.errors.folderId}
                    />

                    <Stack gap={6}>
                        <Text className={styles.createFile__fieldLabel}>{t('fileLabel')}</Text>
                        <Dropzone
                            accept={supportedExtensions}
                            disabled={isFormDisabled}
                            maxSize={config?.maxFileSize}
                            multiple={false}
                            onDrop={handleDrop}
                            onReject={handleReject}
                        >
                            <Group className={styles.createFile__dropzoneContent} gap="md" wrap="nowrap">
                                <Dropzone.Accept>
                                    <Check color="var(--mantine-color-teal-6)" size={36} strokeWidth={1.8} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <X color="var(--mantine-color-red-6)" size={36} strokeWidth={1.8} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <Upload color="var(--mantine-color-dimmed)" size={36} strokeWidth={1.8} />
                                </Dropzone.Idle>

                                <Stack gap={4}>
                                    <Text className={styles.createFile__dropzoneTitle}>
                                        {getDropzoneTitle(isSubmitting, Boolean(selectedFile), t)}
                                    </Text>
                                    <Text className={styles.createFile__dropzoneHint}>
                                        {isSubmitting
                                            ? t('uploadingHint')
                                            : t('dropzoneHint', {
                                                  extensions: formatSupportedExtensions(supportedExtensions),
                                                  size: config?.maxFileSize ? formatFileSize(config.maxFileSize) : '-',
                                              })}
                                    </Text>
                                </Stack>
                            </Group>
                        </Dropzone>

                        {form.errors.file && <Text className={styles.createFile__fieldError}>{form.errors.file}</Text>}

                        {selectedFile && (
                            <Tooltip label={selectedFile.name}>
                                <Text className={styles.createFile__selectedFile}>
                                    {t('selectedFile', { name: selectedFile.name })}
                                </Text>
                            </Tooltip>
                        )}
                    </Stack>

                    <Chip
                        checked={form.values.isPublic}
                        disabled={isFormDisabled}
                        onChange={(checked) => form.setFieldValue('isPublic', checked)}
                    >
                        {t('publicLabel')}
                    </Chip>

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" disabled={isSubmitting} onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button
                            color="teal"
                            type="submit"
                            loading={isSubmitting}
                            disabled={isFormDisabled || !form.values.name.trim() || !selectedFile}
                        >
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

function getSupportedExtensions(extensions: string[] | undefined): string[] {
    return (extensions ?? [])
        .map((extension) => extension.trim().toLowerCase())
        .filter(Boolean)
        .map((extension) => (extension.startsWith('.') ? extension : `.${extension}`))
}

function getFileValidationError(
    file: File | null,
    maxFileSize: number | undefined,
    t: ReturnType<typeof useTranslations<'Dashboard.MediaLibrary.CreateFile'>>
): string | null {
    if (!file) {
        return t('fileRequired')
    }

    if (maxFileSize && file.size > maxFileSize) {
        return t('fileTooLarge', { size: formatFileSize(maxFileSize) })
    }

    return null
}

function getFileRejectError(
    file: File | null,
    supportedExtensions: string[],
    maxFileSize: number | undefined,
    t: ReturnType<typeof useTranslations<'Dashboard.MediaLibrary.CreateFile'>>
): string {
    if (file && maxFileSize && file.size > maxFileSize) {
        return t('fileTooLarge', { size: formatFileSize(maxFileSize) })
    }

    return t('fileExtensionNotAllowed', {
        extensions: formatSupportedExtensions(supportedExtensions),
    })
}

function formatSupportedExtensions(extensions: string[]): string {
    return extensions.length > 0 ? extensions.join(', ') : '-'
}

function getDropzoneTitle(
    isSubmitting: boolean,
    hasSelectedFile: boolean,
    t: ReturnType<typeof useTranslations<'Dashboard.MediaLibrary.CreateFile'>>
): string {
    if (isSubmitting) {
        return t('uploadingTitle')
    }

    return hasSelectedFile ? t('selectedFileTitle') : t('dropzoneTitle')
}
