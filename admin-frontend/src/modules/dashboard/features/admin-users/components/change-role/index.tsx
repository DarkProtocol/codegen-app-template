'use client'

import { Button, Group, Modal, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import type { AdminUser, AdminUserRole, AdminUserRoleOption } from '@modules/dashboard/models/admin-users-api.interface'
import { adminUsersApi, useChangeAdminUserRoleMutation } from '@modules/dashboard/store/admin-users-api'
import type { PaginationRequest } from '@modules/shared/models/pagination.interface'
import { FormRootError } from '@modules/shared/components/form-root-error'
import { useApiFormErrors } from '@modules/shared/hooks/use-api-form-errors'
import { useAppDispatch } from '@modules/shared/hooks/use-app-dispatch'
import { AdminUserRoleSelect } from '../role-select'

type ChangeRoleFormValues = {
    role: string
}

const initialValues: ChangeRoleFormValues = {
    role: '',
}

type Props = {
    opened: boolean
    user: AdminUser | null
    roles: AdminUserRoleOption[]
    loadingRoles: boolean
    listParams: PaginationRequest
    onClose: () => void
}

export function ChangeRoleModal({ opened, user, roles, loadingRoles, listParams, onClose }: Props) {
    const t = useTranslations('Dashboard.AdminUsers.RoleModal')
    const sharedT = useTranslations('Shared.Validation')
    const dispatch = useAppDispatch()
    const [changeAdminUserRole, { isLoading: isSubmitting, error: changeRoleError, reset: resetChangeRole }] =
        useChangeAdminUserRoleMutation()
    const form = useForm<ChangeRoleFormValues>({
        initialValues,
        onValuesChange: () => resetChangeRole(),
        validate: {
            role: (value) => (value.length > 0 ? null : sharedT('requiredField')),
        },
    })

    useApiFormErrors(form, changeRoleError)

    useEffect(() => {
        if (!opened || !user) {
            return
        }

        form.setValues({
            role: user.role,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, user?.id])

    const handleClose = () => {
        form.reset()
        resetChangeRole()
        onClose()
    }

    const handleSubmit = async (values: ChangeRoleFormValues) => {
        if (!user) {
            return
        }

        form.clearErrors()
        resetChangeRole()

        try {
            await changeAdminUserRole({
                id: user.id,
                role: values.role as AdminUserRole,
            }).unwrap()
            updateCachedUserRole(dispatch, listParams, user.id, values.role as AdminUserRole)
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
        <Modal opened={opened} onClose={handleClose} title={user ? t('titleWithEmail', { email: user.email }) : ''}>
            <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <AdminUserRoleSelect
                        required
                        label={t('roleLabel')}
                        placeholder={t('rolePlaceholder')}
                        roles={roles}
                        value={form.values.role}
                        loading={loadingRoles}
                        disabled={isSubmitting}
                        error={form.errors.role}
                        onChange={(value) => form.setFieldValue('role', value)}
                    />

                    <FormRootError error={form.errors.root} />

                    <Group justify="flex-end" mt="sm">
                        <Button type="button" variant="subtle" color="gray" onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button
                            color="indigo"
                            type="submit"
                            loading={isSubmitting}
                            disabled={roles.length === 0 || !form.values.role || form.values.role === user?.role}
                        >
                            {t('submit')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

function updateCachedUserRole(
    dispatch: ReturnType<typeof useAppDispatch>,
    listParams: PaginationRequest,
    id: string,
    role: AdminUserRole
) {
    dispatch(
        adminUsersApi.util.updateQueryData('adminUsersList', listParams, (draft) => {
            const user = draft.data.find((item) => item.id === id)

            if (user) {
                user.role = role
            }
        })
    )
}
