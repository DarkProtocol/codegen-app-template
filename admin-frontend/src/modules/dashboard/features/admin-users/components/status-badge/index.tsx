import { Badge, type MantineColor } from '@mantine/core'
import { useTranslations } from 'next-intl'

type AdminUserStatus = 'active' | 'banned'

const statusColors: Record<AdminUserStatus, MantineColor> = {
    active: 'green',
    banned: 'red',
}

type Props = {
    status: AdminUserStatus
}

export function AdminUserStatusBadge({ status }: Props) {
    const t = useTranslations('Dashboard.AdminUsers.Statuses')

    return (
        <Badge color={statusColors[status]} variant="light">
            {t(status)}
        </Badge>
    )
}
