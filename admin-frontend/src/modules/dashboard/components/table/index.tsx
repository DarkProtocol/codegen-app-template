'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
    ActionIcon,
    Card,
    Center,
    Group,
    Menu,
    Pagination,
    ScrollArea,
    Skeleton,
    Stack,
    Table,
    Text,
    type MantineColor,
} from '@mantine/core'
import { usePagination } from '@mantine/hooks'
import { EllipsisVertical, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { PaginationResponse } from '@modules/shared/models/pagination.interface'
import styles from './styles.module.scss'

const DEFAULT_SKELETON_ROWS = 5
const MENU_ITEM_ICON_SIZE = 16
const MENU_ITEM_ICON_STROKE_WIDTH = 1.9

type DashboardTableRow = {
    id?: string | number
}

export type DashboardTableColumn<T> = {
    header: ReactNode
    align?: 'left' | 'center' | 'right'
    render: (row: T) => ReactNode
}

type DashboardTableMenuItemBase = {
    label: ReactNode
    icon?: LucideIcon
    color?: MantineColor
    disabled?: boolean
    hidden?: boolean
}

export type DashboardTableRowMenuItem =
    | (DashboardTableMenuItemBase & {
          type?: 'button'
          onClick: () => void
      })
    | (DashboardTableMenuItemBase & {
          type: 'link'
          href: string
          target?: '_blank' | '_self'
      })
    | (Omit<DashboardTableMenuItemBase, 'icon' | 'disabled'> & {
          type: 'text'
      })
    | {
          type: 'divider'
          hidden?: boolean
      }

type DashboardTableProps<T extends DashboardTableRow> = {
    response: PaginationResponse<T> | undefined
    columns: DashboardTableColumn<T>[]
    loading?: boolean
    rowKey?: (row: T) => string | number
    rowMenuItems?: (row: T) => DashboardTableRowMenuItem[]
    onChangePage?: (page: number) => void
}

export function DashboardTable<T extends DashboardTableRow>({
    response,
    columns,
    loading = false,
    rowKey,
    rowMenuItems,
    onChangePage,
}: DashboardTableProps<T>) {
    const t = useTranslations('Dashboard.Table')
    const hasRowMenu = Boolean(rowMenuItems)
    const columnCount = columns.length + (hasRowMenu ? 1 : 0)
    const rows = response?.data ?? []
    const isLoading = loading || response?.data === undefined
    const pagination = usePagination({
        total: response?.pages ?? 1,
        page: response?.currentPage ?? 1,
        onChange: onChangePage,
    })
    const hasPagination = Boolean(response && response.pages > 1 && onChangePage)

    const getRowKey = (row: T, index: number) => rowKey?.(row) ?? row.id ?? index

    return (
        <Card className={styles.dashboardTable} radius="md" padding="lg" pb={hasPagination ? 'lg' : 'md'} withBorder>
            <Stack gap="lg">
                <ScrollArea type="hover">
                    <Table
                        className={styles.dashboardTable__table}
                        verticalSpacing="md"
                        horizontalSpacing="lg"
                        w="100%"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                {columns.map((column, index) => (
                                    <Table.Th key={index} ta={column.align}>
                                        {column.header}
                                    </Table.Th>
                                ))}

                                {hasRowMenu && <Table.Th className={styles.dashboardTable__actionsHeader} />}
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {isLoading &&
                                Array.from({ length: DEFAULT_SKELETON_ROWS }).map((_, rowIndex) => (
                                    <Table.Tr key={`skeleton-${rowIndex}`}>
                                        {columns.map((column, columnIndex) => (
                                            <Table.Td key={columnIndex} ta={column.align}>
                                                <Skeleton height={18} radius="sm" />
                                            </Table.Td>
                                        ))}

                                        {hasRowMenu && (
                                            <Table.Td className={styles.dashboardTable__actionsCell}>
                                                <Group justify="flex-end">
                                                    <Skeleton circle width={34} height={34} />
                                                </Group>
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                ))}

                            {!isLoading && rows.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={columnCount}>
                                        <Center className={styles.dashboardTable__empty}>
                                            <Text c="dimmed" size="sm">
                                                {t('empty')}
                                            </Text>
                                        </Center>
                                    </Table.Td>
                                </Table.Tr>
                            )}

                            {!isLoading &&
                                rows.map((row, rowIndex) => {
                                    const menuItems = rowMenuItems?.(row).filter((item) => !item.hidden) ?? []

                                    return (
                                        <Table.Tr key={getRowKey(row, rowIndex)}>
                                            {columns.map((column, columnIndex) => (
                                                <Table.Td key={columnIndex} ta={column.align}>
                                                    {column.render(row)}
                                                </Table.Td>
                                            ))}

                                            {hasRowMenu && (
                                                <Table.Td className={styles.dashboardTable__actionsCell}>
                                                    <Group justify="flex-end">
                                                        {menuItems.length > 0 && (
                                                            <Menu
                                                                position="bottom-end"
                                                                shadow="md"
                                                                width={210}
                                                                zIndex={1100}
                                                                transitionProps={{
                                                                    transition: 'pop-top-right',
                                                                    duration: 160,
                                                                    timingFunction: 'ease',
                                                                }}
                                                            >
                                                                <Menu.Target>
                                                                    <ActionIcon
                                                                        aria-label={t('openRowMenu')}
                                                                        color="gray"
                                                                        variant="subtle"
                                                                        radius="md"
                                                                    >
                                                                        <EllipsisVertical size={18} strokeWidth={1.9} />
                                                                    </ActionIcon>
                                                                </Menu.Target>

                                                                <Menu.Dropdown>
                                                                    {menuItems.map((item, itemIndex) => (
                                                                        <DashboardTableRowMenuItemView
                                                                            key={itemIndex}
                                                                            item={item}
                                                                        />
                                                                    ))}
                                                                </Menu.Dropdown>
                                                            </Menu>
                                                        )}
                                                    </Group>
                                                </Table.Td>
                                            )}
                                        </Table.Tr>
                                    )
                                })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {hasPagination && response && (
                    <Group className={styles.dashboardTable__pagination} justify="center">
                        <Pagination
                            className={styles.dashboardTable__paginationDesktop}
                            total={response.pages}
                            value={pagination.active}
                            onChange={pagination.setPage}
                            color="indigo"
                            radius="md"
                        />
                        <Pagination
                            className={styles.dashboardTable__paginationMobile}
                            total={response.pages}
                            value={pagination.active}
                            onChange={pagination.setPage}
                            boundaries={1}
                            siblings={0}
                            color="indigo"
                            radius="md"
                            size="sm"
                        />
                    </Group>
                )}
            </Stack>
        </Card>
    )
}

function DashboardTableRowMenuItemView({ item }: { item: DashboardTableRowMenuItem }) {
    if (item.type === 'divider') {
        return <Menu.Divider />
    }

    if (item.type === 'text') {
        return (
            <Menu.Label c={item.color} className={styles.dashboardTable__menuLabel}>
                {item.label}
            </Menu.Label>
        )
    }

    if (item.type === 'link') {
        const icon = renderMenuItemIcon(item.icon)

        if (item.href.startsWith('/')) {
            return (
                <Menu.Item
                    component={Link}
                    href={item.href}
                    color={item.color}
                    disabled={item.disabled}
                    leftSection={icon}
                    target={item.target}
                >
                    {item.label}
                </Menu.Item>
            )
        }

        return (
            <Menu.Item
                component="a"
                href={item.href}
                color={item.color}
                disabled={item.disabled}
                leftSection={icon}
                target={item.target}
                rel={item.target === '_blank' ? 'noreferrer' : undefined}
            >
                {item.label}
            </Menu.Item>
        )
    }

    return (
        <Menu.Item
            color={item.color}
            disabled={item.disabled}
            leftSection={renderMenuItemIcon(item.icon)}
            onClick={item.onClick}
        >
            {item.label}
        </Menu.Item>
    )
}

function renderMenuItemIcon(Icon?: LucideIcon) {
    return Icon ? <Icon size={MENU_ITEM_ICON_SIZE} strokeWidth={MENU_ITEM_ICON_STROKE_WIDTH} /> : undefined
}
