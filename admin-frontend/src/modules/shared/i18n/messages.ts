import { i18n as authI18n } from '@modules/auth'
import { i18n as dashboardI18n } from '@modules/dashboard'
import { defaultLocale, sharedMessages } from './shared-messages'

export const messages = {
    ru: {
        ...authI18n.ru,
        ...dashboardI18n.ru,
        Shared: sharedMessages.ru,
    },
    en: {
        ...authI18n.en,
        ...dashboardI18n.en,
        Shared: sharedMessages.en,
    },
} as const

export type AppLocale = keyof typeof messages

export { defaultLocale }
export const defaultTimeZone = 'UTC'

export function getAppLocale(): AppLocale {
    const locale = process.env.APP_LOCALE

    return locale && locale in messages ? (locale as AppLocale) : defaultLocale
}
