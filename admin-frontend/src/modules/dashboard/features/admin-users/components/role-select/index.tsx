'use client'

import { Select, type SelectProps } from '@mantine/core'
import { useTranslations } from 'next-intl'

import type { AdminUserRole, AdminUserRoleOption } from '@modules/dashboard/models/admin-users-api.interface'
import { AdminUserRoleBadge } from '../role-badge'

type Props = Omit<SelectProps, 'data' | 'disabled' | 'onChange' | 'renderOption' | 'value'> & {
    value: string
    roles: AdminUserRoleOption[]
    loading?: boolean
    disabled?: boolean
    onChange: (value: string) => void
}

export function AdminUserRoleSelect({ value, roles, loading, disabled, onChange, ...props }: Props) {
    const t = useTranslations('Dashboard.AdminUsers')
    const roleOptions = roles.map((role) => ({
        value: role.value,
        label: t(`Roles.${role.value}`),
    }))

    return (
        <Select
            data={roleOptions}
            value={value || null}
            disabled={loading || disabled}
            renderOption={({ option }) => <AdminUserRoleBadge role={option.value as AdminUserRole} />}
            onChange={(nextValue) => onChange(nextValue ?? '')}
            {...props}
        />
    )
}
