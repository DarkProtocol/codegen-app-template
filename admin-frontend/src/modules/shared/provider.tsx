'use client'

import { Provider as BaseProvider } from 'react-redux'
import { setupStore } from '@modules/shared/store/store'
import { MantineColorScheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { defaultTimeZone, type AppLocale } from '@modules/shared/i18n/messages'
import { theme } from '@modules/shared/theme'
import { RouteProgress } from '@modules/shared/components/route-progress'

const store = setupStore()

interface ProviderProps {
    defaultColorScheme: MantineColorScheme
    locale: AppLocale
    messages: (typeof import('@modules/shared/i18n/messages').messages)[AppLocale]
    children: ReactNode
}

export function Provider({ defaultColorScheme, locale, messages, children }: ProviderProps) {
    return (
        <BaseProvider store={store}>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
                <MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
                    <RouteProgress />
                    {children}
                    <Notifications
                        position="bottom-right"
                        autoClose={3500}
                        transitionDuration={180}
                        containerWidth={420}
                        zIndex={1300}
                    />
                </MantineProvider>
            </NextIntlClientProvider>
        </BaseProvider>
    )
}
