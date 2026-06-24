'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Collapse, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import { useMustUser } from '@modules/auth'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import styles from './styles.module.scss'
import { dashboardMenuItems, type DashboardMenuItem, type DashboardMenuSubItem } from './items'

type Props = {
    onNavigate?: () => void
}

function isLinkActive(pathname: string, link: string): boolean {
    return pathname === link || pathname.startsWith(`${link}/`)
}

export function Menu({ onNavigate }: Props) {
    const pathname = usePathname()
    const { can } = useMustUser()

    const visibleMenuItems = dashboardMenuItems
        .map((item) => ({
            ...item,
            children: item.children?.filter((child) => !child.can || can[child.can]),
        }))
        .filter((item) => (item.children ? item.children.length > 0 : !item.can || can[item.can]))

    return (
        <nav className={styles.menu}>
            <Stack className={styles.menu__group} gap={8}>
                {visibleMenuItems.map((item) =>
                    item.children && item.children.length > 0 ? (
                        <MenuGroup
                            key={item.label}
                            item={{ ...item, children: item.children }}
                            pathname={pathname}
                            onNavigate={onNavigate}
                        />
                    ) : (
                        <MenuLink key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />
                    )
                )}
            </Stack>
        </nav>
    )
}

type MenuLinkProps = {
    item: DashboardMenuItem
    pathname: string
    onNavigate?: () => void
}

function MenuLink({ item, pathname, onNavigate }: MenuLinkProps) {
    const t = useTranslations('Dashboard.Menu')
    const Icon = item.icon
    const link = item.link as string
    const isSelected = Boolean(item.link) && isLinkActive(pathname, link)

    return (
        <UnstyledButton
            component={Link}
            className={styles.menu__item}
            href={link}
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

type MenuGroupProps = {
    item: DashboardMenuItem & { children: DashboardMenuSubItem[] }
    pathname: string
    onNavigate?: () => void
}

function MenuGroup({ item, pathname, onNavigate }: MenuGroupProps) {
    const Icon = item.icon
    const hasActiveChild = item.children.some((child) => isLinkActive(pathname, child.link))
    const [opened, setOpened] = useState(hasActiveChild)

    return (
        <div>
            <UnstyledButton
                className={styles.menu__item}
                aria-expanded={opened}
                onClick={() => setOpened((value) => !value)}
            >
                <ThemeIcon className={styles.menu__icon} variant="light" color="indigo" radius="md" size={32}>
                    <Icon size={18} strokeWidth={1.9} />
                </ThemeIcon>
                <Text className={styles.menu__label} span>
                    {item.label}
                </Text>
                <ChevronDown className={styles.menu__arrow} size={16} strokeWidth={2} />
            </UnstyledButton>

            <Collapse expanded={opened}>
                <Stack className={styles.menu__sublist} gap={4}>
                    {item.children.map((child) => (
                        <UnstyledButton
                            key={child.link}
                            component={Link}
                            className={styles.menu__subitem}
                            href={child.link}
                            data-selected={isLinkActive(pathname, child.link)}
                            onClick={onNavigate}
                        >
                            <Text span>{child.label}</Text>
                        </UnstyledButton>
                    ))}
                </Stack>
            </Collapse>
        </div>
    )
}
