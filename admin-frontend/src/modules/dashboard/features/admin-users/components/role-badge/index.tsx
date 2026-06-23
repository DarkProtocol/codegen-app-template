import { Badge, type MantineColor } from '@mantine/core'
import { useTranslations } from 'next-intl'

import type { AdminUserRole } from '@modules/dashboard/models/admin-users-api.interface'

const roleColors: Record<AdminUserRole, MantineColor> = {
    admin: 'indigo',
    editor: 'teal',
}

type Props = {
    role: AdminUserRole
}

export function AdminUserRoleBadge({ role }: Props) {
    const t = useTranslations('Dashboard.AdminUsers.Roles')

    return (
        <Badge color={roleColors[role]} variant="light">
            {t(role)}
        </Badge>
    )
}
