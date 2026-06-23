'use client'

import { ActionIcon, TextInput, Tooltip, type TextInputProps as MantineTextInputProps } from '@mantine/core'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { MouseEvent } from 'react'

import { useCopy } from '@modules/shared/hooks/use-copy'

const COPY_TOOLTIP_Z_INDEX = 1300

type Props = Omit<
    MantineTextInputProps,
    'disabled' | 'readOnly' | 'rightSection' | 'rightSectionPointerEvents' | 'value'
> & {
    value: string
    copyLabel?: string
    copiedLabel?: string
}

export function CopyInput({ value, copyLabel, copiedLabel, ...props }: Props) {
    const t = useTranslations('Shared.Components.CopyInput')
    const { copy, copied } = useCopy()
    const resolvedCopyLabel = copyLabel ?? t('copy')
    const resolvedCopiedLabel = copiedLabel ?? t('copied')
    const currentCopyLabel = copied ? resolvedCopiedLabel : resolvedCopyLabel

    const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        if (!value) {
            return
        }

        copy(value)
    }

    return (
        <TextInput
            {...props}
            value={value}
            readOnly
            rightSectionPointerEvents="all"
            rightSectionWidth={42}
            rightSection={
                <Tooltip
                    label={currentCopyLabel}
                    opened={copied ? true : undefined}
                    position="top"
                    zIndex={COPY_TOOLTIP_Z_INDEX}
                >
                    <ActionIcon
                        type="button"
                        aria-label={currentCopyLabel}
                        color="gray"
                        disabled={!value}
                        radius="sm"
                        variant="subtle"
                        onClick={handleCopy}
                    >
                        <Copy size={18} strokeWidth={1.9} />
                    </ActionIcon>
                </Tooltip>
            }
        />
    )
}
