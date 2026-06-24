'use client'

import { Button, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useTranslations } from 'next-intl'

import { EmailInput } from '@modules/shared/components/email-input'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { PasswordInput } from '@modules/shared/components/password-input'
import { DashboardCreateButton } from '@modules/dashboard/components/create-button'
import type { AdminUserRole, AdminUserRoleOption } from '@modules/dashboard/models/admin-users-api.interface'
import { useCreateAdminUserMutation } from '@modules/dashboard/store/admin-users-api'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import { isValidEmail } from '@modules/shared/helpers/validation'
import { AdminUserRoleSelect } from '../role-select'

type CreateAdminUserFormValues = {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
}

const initialValues: CreateAdminUserFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
}

type Props = {
    opened: boolean
    roles: AdminUserRoleOption[]
    loadingRoles: boolean
    onClose: () => void
    onCreated: () => void
}

export function AdminUserCreateModal({ opened, roles, loadingRoles, onClose, onCreated }: Props) {
    const t = useTranslations('Dashboard.AdminUsers')
    const sharedT = useTranslations('Shared.Validation')
    const [createAdminUser, { isLoading: isSubmitting, error: createAdminUserError, reset: resetCreateAdminUser }] =
        useCreateAdminUserMutation()
    const form = useForm<CreateAdminUserFormValues>({
        initialValues,
        onValuesChange: () => resetCreateAdminUser(),
        validate: {
            firstName: (value) => (value.trim().length > 0 ? null : sharedT('requiredField')),
            email: (value) => {
                if (value.trim().length === 0) {
                    return sharedT('requiredField')
                }

                return isValidEmail(value) ? null : sharedT('invalidEmail')
            },
            password: (value) => (value.length >= 6 ? null : sharedT('passwordMinLength')),
            role: (value) => (value.length > 0 ? null : sharedT('requiredField')),
        },
        transformValues: (values) => ({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            password: values.password,
            role: values.role,
        }),
    })

    useApiFormErrors(form, createAdminUserError)

    const handleClose = () => {
        form.reset()
        resetCreateAdminUser()
        onClose()
    }

    const handleSubmit = async (values: CreateAdminUserFormValues) => {
        form.clearErrors()
        resetCreateAdminUser()

        try {
            await createAdminUser({
                firstName: values.firstName,
                lastName: values.lastName || null,
                email: values.email,
                password: values.password,
                role: values.role as AdminUserRole,
            }).unwrap()
            handleClose()
            onCreated()
            notifications.show({
                color: 'teal',
                title: t('Create.successTitle'),
                message: t('Create.successMessage'),
            })
        } catch {
            // Field and root errors are mapped by useApiFormErrors.
        }
    }

    return (
        <Modal opened={opened} onClose={handleClose} title={t('Create.title')} size="lg">
            <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <TextInput
                            required
                            label={t('Fields.firstName')}
                            placeholder={t('Fields.firstNamePlaceholder')}
                            autoComplete="given-name"
                            {...form.getInputProps('firstName')}
                        />

                        <TextInput
                            label={t('Fields.lastName')}
                            placeholder={t('Fields.lastNamePlaceholder')}
                            autoComplete="family-name"
                            {...form.getInputProps('lastName')}
                        />

                        <EmailInput
                            required
                            label={t('Fields.email')}
                            placeholder={t('Fields.emailPlaceholder')}
                            autoComplete="email"
                            {...form.getInputProps('email')}
                        />

                        <PasswordInput
                            required
                            label={t('Fields.password')}
                            placeholder={t('Fields.passwordPlaceholder')}
                            autoComplete="new-password"
                            {...form.getInputProps('password')}
                        />
                    </SimpleGrid>

                    <AdminUserRoleSelect
                        required
                        label={t('Fields.role')}
                        placeholder={t('Fields.rolePlaceholder')}
                        roles={roles}
                        value={form.values.role}
                        loading={loadingRoles}
                        disabled={isSubmitting}
                        error={form.errors.role}
                        onChange={(value) => form.setFieldValue('role', value)}
                    />

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end">
                        <Button type="button" variant="subtle" color="gray" onClick={handleClose}>
                            {t('Create.cancel')}
                        </Button>
                        <DashboardCreateButton type="submit" loading={isSubmitting} disabled={roles.length === 0}>
                            {t('Create.submit')}
                        </DashboardCreateButton>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
