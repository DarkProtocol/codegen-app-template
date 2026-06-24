'use client'

import { Alert, Button, Fieldset, Group, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTimeout } from '@mantine/hooks'
import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { FormRootError } from '@modules/shared/components/form-root-error'
import { PasswordInput } from '@modules/shared/components/password-input'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import { useChangePasswordMutation } from '@modules/dashboard/store/account-api'

import styles from '@modules/dashboard/features/settings/styles.module.scss'

type PasswordFormValues = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const initialValues: PasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
}

type Props = {
    onSuccess?: () => void
}

export function SettingsPasswordForm({ onSuccess }: Props) {
    const t = useTranslations('Dashboard.Settings.Password')
    const sharedT = useTranslations('Shared.Validation')
    const [changePassword, { isLoading: isSubmitting, error: changePasswordError, reset: resetChangePassword }] =
        useChangePasswordMutation()
    const [showSuccess, setShowSuccess] = useState(false)
    const successTimeout = useTimeout(() => setShowSuccess(false), 2000)
    const form = useForm<PasswordFormValues>({
        initialValues,
        onValuesChange: () => {
            resetChangePassword()
            successTimeout.clear()
            setShowSuccess(false)
        },
        validate: {
            currentPassword: (value) => (value.length > 0 ? null : sharedT('requiredField')),
            newPassword: (value) => (value.length >= 6 ? null : sharedT('passwordMinLength')),
            confirmPassword: (value, values) => {
                if (value.length === 0) {
                    return sharedT('requiredField')
                }

                return value === values.newPassword ? null : sharedT('passwordsDoNotMatch')
            },
        },
    })

    useApiFormErrors(form, changePasswordError)

    const handleSubmit = async (values: PasswordFormValues) => {
        form.clearErrors()
        resetChangePassword()
        setShowSuccess(false)

        try {
            await changePassword({
                currentPassword: values.currentPassword,
                password: values.newPassword,
            }).unwrap()
            form.reset()
            setShowSuccess(true)
            successTimeout.start()
            onSuccess?.()
        } catch {
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    return (
        <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
            <Fieldset className={styles.settingsDrawer__fieldset} legend={t('title')}>
                <Stack gap="md">
                    <PasswordInput
                        required
                        label={t('currentPasswordLabel')}
                        placeholder={t('currentPasswordPlaceholder')}
                        autoComplete="current-password"
                        {...form.getInputProps('currentPassword')}
                    />
                    <PasswordInput
                        required
                        label={t('newPasswordLabel')}
                        placeholder={t('newPasswordPlaceholder')}
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

                    {showSuccess && (
                        <Alert color="teal" variant="light" radius="md" py="xs">
                            <Group justify="center" gap={6}>
                                <CircleCheck size={16} strokeWidth={2} />
                                <Text size="sm" fw={600}>
                                    {t('successMessage')}
                                </Text>
                            </Group>
                        </Alert>
                    )}

                    <Group justify="flex-end">
                        <Button type="submit" loading={isSubmitting}>
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </Fieldset>
        </form>
    )
}
