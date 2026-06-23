import { useClipboard } from '@mantine/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

const COPY_FEEDBACK_TIMEOUT = 1000

export function useCopy() {
    const clipboard = useClipboard({ timeout: COPY_FEEDBACK_TIMEOUT })
    const [fallbackCopied, setFallbackCopied] = useState(false)
    const pendingCopyValueRef = useRef<string | null>(null)

    const copy = useCallback(
        (value: string) => {
            if (!value) {
                return
            }

            clipboard.reset()
            setFallbackCopied(false)
            pendingCopyValueRef.current = value
            clipboard.copy(value)
        },
        [clipboard]
    )

    useEffect(() => {
        if (!clipboard.error || !pendingCopyValueRef.current) {
            return
        }

        const copied = copyWithFallback(pendingCopyValueRef.current)

        pendingCopyValueRef.current = null
        clipboard.reset()

        if (copied) {
            setFallbackCopied(true)
        }
    }, [clipboard])

    useEffect(() => {
        if (!fallbackCopied) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setFallbackCopied(false)
        }, COPY_FEEDBACK_TIMEOUT)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [fallbackCopied])

    return {
        copy,
        copied: clipboard.copied || fallbackCopied,
    }
}

function copyWithFallback(value: string): boolean {
    if (!document.body) {
        return false
    }

    const textarea = document.createElement('textarea')

    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    textarea.style.opacity = '0'

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, value.length)

    try {
        return document.execCommand('copy')
    } catch {
        return false
    } finally {
        document.body.removeChild(textarea)
    }
}
