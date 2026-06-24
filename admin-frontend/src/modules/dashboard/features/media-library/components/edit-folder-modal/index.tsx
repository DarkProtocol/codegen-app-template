import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { MediaLibraryFolder } from '@modules/dashboard/models/media-library-api.interface'
import { useChangeMediaLibraryFolderMutation } from '@modules/dashboard/store/media-library-api'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'

type EditFolderFormValues = {
    name: string
}

type Props = {
    opened: boolean
    folder: MediaLibraryFolder | null
    onClose: () => void
    reloadFolder: () => unknown
}

export function EditFolderModal({ opened, folder, onClose, reloadFolder }: Props) {
    const t = useTranslations('Dashboard.MediaLibrary.EditFolder')
    const sharedT = useTranslations('Shared.Validation')
    const [isReloading, setIsReloading] = useState(false)
    const [changeFolder, { isLoading: isChanging, error: changeFolderError, reset: resetChangeFolder }] =
        useChangeMediaLibraryFolderMutation()
    const form = useForm<EditFolderFormValues>({
        initialValues: {
            name: '',
        },
        onValuesChange: () => resetChangeFolder(),
        validate: {
            name: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
        },
        transformValues: (values) => ({
            name: values.name.trim(),
        }),
    })
    const formRef = useRef(form)
    const folderId = folder?.id
    const folderName = folder?.name
    const isSubmitting = isChanging || isReloading

    useApiFormErrors(form, changeFolderError)

    useEffect(() => {
        formRef.current = form
    }, [form])

    useEffect(() => {
        const currentForm = formRef.current

        currentForm.clearErrors()
        resetChangeFolder()

        if (!folderId) {
            currentForm.reset()
            return
        }

        const values = {
            name: folderName ?? '',
        }

        currentForm.setValues(values)
        currentForm.resetDirty(values)
    }, [folderId, folderName, resetChangeFolder])

    const handleClose = () => {
        if (isSubmitting) {
            return
        }

        resetChangeFolder()
        onClose()
    }

    const handleSubmit = async (values: EditFolderFormValues) => {
        if (!folder) {
            return
        }

        form.clearErrors()
        resetChangeFolder()

        try {
            await changeFolder({
                id: folder.id,
                name: values.name,
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

    return (
        <Modal opened={opened} title={t('title')} onClose={handleClose}>
            <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        autoFocus
                        label={t('nameLabel')}
                        placeholder={t('namePlaceholder')}
                        disabled={isSubmitting}
                        {...form.getInputProps('name')}
                    />

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" disabled={isSubmitting} onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button
                            color="teal"
                            type="submit"
                            loading={isSubmitting}
                            disabled={!folder || !form.values.name.trim()}
                        >
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
