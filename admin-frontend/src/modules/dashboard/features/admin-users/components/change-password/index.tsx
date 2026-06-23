'use client'

import { Button, Group, Modal, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useTranslations } from 'next-intl'

import type { AdminUser } from '@modules/dashboard/models/admin-users-api.interface'
import { useResetAdminUserPasswordMutation } from '@modules/dashboard/store/admin-users-api'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { PasswordInput } from '@modules/shared/components/password-input'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'

type ChangePasswordFormValues = {
    newPassword: string
    confirmPassword: string
}

const initialValues: ChangePasswordFormValues = {
    newPassword: '',
    confirmPassword: '',
}

type Props = {
    opened: boolean
    user: AdminUser | null
    onClose: () => void
}

export function ChangePasswordModal({ opened, user, onClose }: Props) {
    const t = useTranslations('Dashboard.AdminUsers.PasswordModal')
    const sharedT = useTranslations('Shared.Validation')
    const [resetAdminUserPassword, { isLoading: isSubmitting, error: resetPasswordError, reset: resetPassword }] =
        useResetAdminUserPasswordMutation()
    const form = useForm<ChangePasswordFormValues>({
        initialValues,
        validate: {
            newPassword: (value) => (value.length >= 6 ? null : sharedT('passwordMinLength')),
            confirmPassword: (value, values) => {
                if (value.length === 0) {
                    return sharedT('requiredField')
                }

                return value === values.newPassword ? null : sharedT('passwordsDoNotMatch')
            },
        },
    })

    useApiFormErrors(form, resetPasswordError)

    const handleClose = () => {
        form.reset()
        resetPassword()
        onClose()
    }

    const handleSubmit = async (values: ChangePasswordFormValues) => {
        if (!user) {
            return
        }

        form.clearErrors()
        resetPassword()

        try {
            await resetAdminUserPassword({
                id: user.id,
                password: values.newPassword,
            }).unwrap()
            handleClose()
            notifications.show({
                color: 'teal',
                title: t('successTitle'),
                message: t('successMessage'),
            })
        } catch {
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={user ? t('titleWithEmail', { email: user.email }) : ''}
            size="lg"
        >
            <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <PasswordInput
                        required
                        label={t('passwordLabel')}
                        placeholder={t('passwordPlaceholder')}
                        autoComplete="new-password"
                        {...form.getInputProps('newPassword')}
                    />
                    <PasswordInput
                        required
                        label={t('confirmPasswordLabel')}
                        placeholder={t('confirmPasswordPlaceholder')}
                        autoComplete="new-password"
                        {...form.getInputProps('confirmPassword')}
                    />

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end" mt="sm">
                        <Button variant="subtle" color="gray" onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button color="indigo" type="submit" loading={isSubmitting}>
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
