'use client'

import { Drawer, ScrollArea, Stack } from '@mantine/core'
import { useTranslations } from 'next-intl'

import { SettingsPasswordForm } from './components/password-form'
import { SettingsProfileForm } from './components/profile-form'
import styles from './styles.module.scss'

type Props = {
    opened: boolean
    onClose: () => void
}

export function SettingsDrawer({ opened, onClose }: Props) {
    const t = useTranslations('Dashboard.Settings')

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={t('title')}
            position="right"
            size="md"
            offset={8}
            radius="md"
            zIndex={1200}
            scrollAreaComponent={ScrollArea.Autosize}
            overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
            classNames={{ title: styles.settingsDrawer__title }}
        >
            <Stack className={styles.settingsDrawer} gap="lg">
                <SettingsProfileForm />
                <SettingsPasswordForm />
            </Stack>
        </Drawer>
    )
}
