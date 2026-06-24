'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { AppShell, Box, Group, Text } from '@mantine/core'
import { useTranslations } from 'next-intl'

import { Menu } from './menu'
import { MobileMenu } from './mobile-menu'
import styles from './styles.module.scss'
import { UserMenu } from './user-menu'

type Props = {
    appName: string
    children: ReactNode
}

export function DashboardLayout({ appName, children }: Props) {
    const t = useTranslations('Dashboard.Layout')

    return (
        <AppShell
            className={styles.layout}
            header={{ height: 72 }}
            navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: true } }}
        >
            <AppShell.Header className={styles.layout__header}>
                <Group className={styles.layout__headerInner} h="100%" justify="space-between" wrap="nowrap">
                    <MobileMenu />

                    <Link className={styles.layout__brandLink} href="/">
                        <Group className={styles.layout__brand} gap={4} wrap="nowrap">
                            <Text className={styles.layout__brandName} span fw={700}>
                                {appName}
                            </Text>
                        </Group>
                    </Link>

                    <UserMenu />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar className={styles.layout__sidebar} aria-label={t('navigationLabel')}>
                <Menu />
            </AppShell.Navbar>

            <AppShell.Main className={styles.layout__main}>
                <Box className={styles.layout__mainInner}>{children}</Box>
            </AppShell.Main>
        </AppShell>
    )
}
