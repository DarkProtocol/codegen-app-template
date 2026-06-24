import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useCreateMediaLibraryFolderMutation } from '@modules/dashboard/store/media-library-api'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'

type CreateFolderFormValues = {
    name: string
}

const initialValues: CreateFolderFormValues = {
    name: '',
}

type Props = {
    opened: boolean
    currentFolder?: string
    onClose: () => void
    reloadFolder: () => unknown
}

export function CreateFolderModal({ opened, currentFolder, onClose, reloadFolder }: Props) {
    const t = useTranslations('Dashboard.MediaLibrary.CreateFolder')
    const sharedT = useTranslations('Shared.Validation')
    const [isReloading, setIsReloading] = useState(false)
    const [createFolder, { isLoading: isCreating, error: createFolderError, reset: resetCreateFolder }] =
        useCreateMediaLibraryFolderMutation()
    const form = useForm<CreateFolderFormValues>({
        initialValues,
        onValuesChange: () => resetCreateFolder(),
        validate: {
            name: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
        },
        transformValues: (values) => ({
            name: values.name.trim(),
        }),
    })
    const isSubmitting = isCreating || isReloading

    useApiFormErrors(form, createFolderError)

    const handleClose = () => {
        if (isSubmitting) {
            return
        }

        form.reset()
        resetCreateFolder()
        onClose()
    }

    const handleSubmit = async (values: CreateFolderFormValues) => {
        form.clearErrors()
        resetCreateFolder()

        try {
            await createFolder({
                parentId: currentFolder,
                name: values.name,
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
                        <Button color="teal" type="submit" loading={isSubmitting} disabled={!form.values.name.trim()}>
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
