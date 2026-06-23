import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/notifications/styles.css'
import '@/styles/globals.scss'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import { getAppLocale, messages } from '@modules/shared/i18n/messages'
import { Provider as SharedProvider } from '@modules/shared/provider'
import { Provider as AuthProvider } from '@modules/auth'

export const metadata: Metadata = {
    title: 'Property Bot Admin',
    description: 'Admin login',
}

const defaultColorScheme = 'light'

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const appLocale = getAppLocale()

    return (
        <html lang={appLocale} {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme={defaultColorScheme} />
            </head>
            <body>
                <SharedProvider
                    defaultColorScheme={defaultColorScheme}
                    locale={appLocale}
                    messages={messages[appLocale]}
                >
                    <AuthProvider>{children}</AuthProvider>
                </SharedProvider>
            </body>
        </html>
    )
}
