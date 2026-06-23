'use client'

import type { ReactNode } from 'react'
import { Button, Group, Modal, Stack, Text, type MantineColor } from '@mantine/core'
import { useTranslations } from 'next-intl'

type Props = {
    opened: boolean
    title?: ReactNode
    message?: ReactNode
    confirmLabel?: ReactNode
    cancelLabel?: ReactNode
    confirmColor?: MantineColor
    loading?: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConfirmModal({
    opened,
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirmColor = 'indigo',
    loading = false,
    onClose,
    onConfirm,
}: Props) {
    const t = useTranslations('Shared.ConfirmModal')
    const modalTitle = title ?? t('title')
    const modalMessage = message ?? t('message')
    const modalConfirmLabel = confirmLabel ?? t('confirm')
    const modalCancelLabel = cancelLabel ?? t('cancel')

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} size="sm">
            <Stack gap="lg">
                {typeof modalMessage === 'string' ? (
                    <Text c="dark.9" size="sm">
                        {modalMessage}
                    </Text>
                ) : (
                    modalMessage
                )}

                <Group justify="flex-end">
                    <Button variant="subtle" color="gray" disabled={loading} onClick={onClose}>
                        {modalCancelLabel}
                    </Button>
                    <Button color={confirmColor} loading={loading} onClick={onConfirm}>
                        {modalConfirmLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}
