import { Images, UsersRound, type LucideIcon } from 'lucide-react'
import type { IAdminPermissions } from '@modules/auth'

export type DashboardMenuItem = {
    icon: LucideIcon
    label: string
    link: string
    can?: keyof IAdminPermissions
}

export const dashboardMenuItems: DashboardMenuItem[] = [
    {
        icon: UsersRound,
        label: 'adminUsers',
        link: '/admin-users',
        can: 'adminUsers',
    },
    {
        icon: Images,
        label: 'mediaLibrary',
        link: '/media-library',
        can: 'adminMedia',
    },
]
