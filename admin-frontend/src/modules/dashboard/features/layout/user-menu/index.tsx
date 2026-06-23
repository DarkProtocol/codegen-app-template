'use client'

import { useState } from 'react'
import { Avatar, Group, Menu as MantineMenu, UnstyledButton } from '@mantine/core'
import { ChevronDown, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLogout, useMustUser } from '@modules/auth'

import styles from './styles.module.scss'

import { SettingsDrawer } from '@modules/dashboard/features/settings'

export function UserMenu() {
    const t = useTranslations('Dashboard.UserMenu')
    const [isOpen, setIsOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [logout, { isLoading: isLogoutLoading }] = useLogout()
    const { user } = useMustUser()
    const avatarInitials = getAvatarInitials(user.firstName, user.lastName)
    const avatarLabel = getUserName(user.firstName, user.lastName)

    return (
        <>
            <MantineMenu
                opened={isOpen}
                onChange={setIsOpen}
                position="bottom-end"
                offset={8}
                shadow="md"
                width={180}
                zIndex={1100}
                transitionProps={{ transition: 'pop-top-right', duration: 170, timingFunction: 'ease' }}
                classNames={{
                    dropdown: styles.userMenu__dropdown,
                    item: styles.userMenu__item,
                }}
            >
                <MantineMenu.Target>
                    <UnstyledButton
                        className={styles.userMenu__trigger}
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        aria-label={t('triggerLabel')}
                        data-open={isOpen}
                    >
                        <Group gap={6} wrap="nowrap">
                            <Avatar
                                className={styles.userMenu__avatar}
                                alt={avatarLabel}
                                color="indigo"
                                radius="xl"
                                size={35}
                                variant="light"
                            >
                                {avatarInitials}
                            </Avatar>
                            <ChevronDown className={styles.userMenu__chevron} size={16} strokeWidth={1.9} />
                        </Group>
                    </UnstyledButton>
                </MantineMenu.Target>

                <MantineMenu.Dropdown>
                    <MantineMenu.Item
                        leftSection={<SettingsIcon size={16} strokeWidth={1.9} />}
                        onClick={() => {
                            setIsOpen(false)
                            setIsSettingsOpen(true)
                        }}
                    >
                        {t('settings')}
                    </MantineMenu.Item>

                    <MantineMenu.Item
                        leftSection={<LogOut size={16} strokeWidth={1.9} />}
                        disabled={isLogoutLoading}
                        onClick={logout}
                    >
                        {t('logout')}
                    </MantineMenu.Item>
                </MantineMenu.Dropdown>
            </MantineMenu>

            <SettingsDrawer opened={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    )
}

function getAvatarInitials(firstName: string, lastName: string | null): string {
    const normalizedFirstName = firstName.trim()
    const normalizedLastName = lastName?.trim()

    if (normalizedLastName) {
        return `${getFirstLetter(normalizedFirstName)}${getFirstLetter(normalizedLastName)}`.toUpperCase()
    }

    return Array.from(normalizedFirstName).slice(0, 2).join('').toUpperCase()
}

function getFirstLetter(value: string): string {
    return Array.from(value)[0] ?? ''
}

function getUserName(firstName: string, lastName: string | null): string {
    return [firstName, lastName].filter(Boolean).join(' ')
}
