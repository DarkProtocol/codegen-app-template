'use client'

import type { ReactNode } from 'react'
import { Breadcrumbs, Group, Stack, Title, UnstyledButton } from '@mantine/core'
import { ChevronRight } from 'lucide-react'

import styles from './styles.module.scss'

import { DashboardCreateButton } from '../create-button'

type DashboardPageHeaderCreateLinkAction = {
    type?: 'link'
    href: string
    label?: ReactNode
}

type DashboardPageHeaderCreateButtonAction = {
    type: 'button'
    label?: ReactNode
    loading?: boolean
    disabled?: boolean
    onClick: () => void
}

type DashboardPageHeaderCreateAction = DashboardPageHeaderCreateLinkAction | DashboardPageHeaderCreateButtonAction

type DashboardPageHeaderBreadcrumb = {
    key: string
    label: ReactNode
    disabled?: boolean
    onClick: () => void
}

type DashboardPageHeaderProps = {
    title: ReactNode
    createAction?: DashboardPageHeaderCreateAction
    actions?: ReactNode
    breadcrumbs?: DashboardPageHeaderBreadcrumb[]
}

export function DashboardPageHeader({ title, createAction, actions, breadcrumbs }: DashboardPageHeaderProps) {
    const resolvedActions =
        actions ??
        (createAction ? (
            createAction.type === 'button' ? (
                <DashboardCreateButton
                    disabled={createAction.disabled}
                    loading={createAction.loading}
                    onClick={createAction.onClick}
                >
                    {createAction.label}
                </DashboardCreateButton>
            ) : (
                <DashboardCreateButton href={createAction.href}>{createAction.label}</DashboardCreateButton>
            )
        ) : null)

    return (
        <Stack className={styles.dashboardPageHeader} gap={8}>
            <Group className={styles.dashboardPageHeader__top} justify="space-between" align="center" gap="md">
                {typeof title === 'string' ? (
                    <Title order={1} className={styles.dashboardPageHeader__title}>
                        {title}
                    </Title>
                ) : (
                    title
                )}

                {resolvedActions && (
                    <Group className={styles.dashboardPageHeader__actions} gap="sm">
                        {resolvedActions}
                    </Group>
                )}
            </Group>

            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs separator={<ChevronRight size={14} strokeWidth={2} />}>
                    {breadcrumbs.map((breadcrumb) => (
                        <UnstyledButton
                            key={breadcrumb.key}
                            className={styles.dashboardPageHeader__breadcrumb}
                            disabled={breadcrumb.disabled}
                            onClick={breadcrumb.onClick}
                        >
                            {breadcrumb.label}
                        </UnstyledButton>
                    ))}
                </Breadcrumbs>
            )}
        </Stack>
    )
}
