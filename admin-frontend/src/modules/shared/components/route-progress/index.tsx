'use client'

import { useEffect, useRef } from 'react'
import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { usePathname } from 'next/navigation'

const COMPLETE_DELAY = 220
const STEP_INTERVAL = 500

export function RouteProgress() {
    const pathname = usePathname()

    const pendingPathRef = useRef<string | null>(null)
    const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        function clearCompleteTimeout() {
            if (completeTimeoutRef.current) {
                clearTimeout(completeTimeoutRef.current)
                completeTimeoutRef.current = null
            }
        }

        function startProgress() {
            clearCompleteTimeout()
            nprogress.start()
        }

        function handleClick(event: MouseEvent) {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return
            }

            const target = event.target

            if (!(target instanceof Element)) {
                return
            }

            const link = target.closest('a[href]')

            if (!(link instanceof HTMLAnchorElement)) {
                return
            }

            if ((link.target && link.target !== '_self') || link.hasAttribute('download')) {
                return
            }

            const nextUrl = new URL(link.href)
            const currentUrl = new URL(window.location.href)

            if (nextUrl.origin !== currentUrl.origin || nextUrl.pathname === currentUrl.pathname) {
                return
            }

            pendingPathRef.current = nextUrl.pathname
            startProgress()
        }

        document.addEventListener('click', handleClick, true)

        return () => {
            document.removeEventListener('click', handleClick, true)
            clearCompleteTimeout()
            nprogress.reset()
        }
    }, [])

    useEffect(() => {
        function clearCompleteTimeout() {
            if (completeTimeoutRef.current) {
                clearTimeout(completeTimeoutRef.current)
                completeTimeoutRef.current = null
            }
        }

        function completeProgress() {
            clearCompleteTimeout()

            nprogress.set(100)

            completeTimeoutRef.current = setTimeout(() => {
                nprogress.complete()
                completeTimeoutRef.current = null
            }, COMPLETE_DELAY)
        }

        if (pendingPathRef.current) {
            pendingPathRef.current = null
            completeProgress()
        }
    }, [pathname])

    return <NavigationProgress color="indigo" size={3} stepInterval={STEP_INTERVAL} />
}
