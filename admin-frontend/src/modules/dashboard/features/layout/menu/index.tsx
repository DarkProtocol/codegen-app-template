'use client'

import Link from 'next/link'
import { Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { useMustUser } from '@modules/auth'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import styles from './styles.module.scss'
import { dashboardMenuItems, type DashboardMenuItem } from './items'

type Props = {
    onNavigate?: () => void
}

export function Menu({ onNavigate }: Props) {
    const pathname = usePathname()
    const { can } = useMustUser()
    const visibleMenuItems = dashboardMenuItems.filter((item) => !item.can || can[item.can])

    return (
        <nav className={styles.menu}>
            <Stack className={styles.menu__group} gap={8}>
                {visibleMenuItems.map((item) => (
                    <MenuItem key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />
                ))}
            </Stack>
        </nav>
    )
}

type MenuItemProps = {
    item: DashboardMenuItem
    pathname: string
    onNavigate?: () => void
}

function MenuItem({ item, pathname, onNavigate }: MenuItemProps) {
    const t = useTranslations('Dashboard.Menu')
    const Icon = item.icon
    const isSelected = pathname === item.link || pathname.startsWith(`${item.link}/`)

    return (
        <UnstyledButton
            component={Link}
            className={styles.menu__item}
            href={item.link}
            data-selected={isSelected}
            onClick={onNavigate}
        >
            <ThemeIcon className={styles.menu__icon} variant="light" color="indigo" radius="md" size={32}>
                <Icon size={18} strokeWidth={1.9} />
            </ThemeIcon>
            <Text className={styles.menu__label} span>
                {t(item.label)}
            </Text>
        </UnstyledButton>
    )
}
