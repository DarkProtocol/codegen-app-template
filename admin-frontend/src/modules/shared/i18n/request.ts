import { getRequestConfig } from 'next-intl/server'
import { defaultTimeZone, getAppLocale, messages } from './messages'

export default getRequestConfig(async () => {
    const locale = getAppLocale()

    return {
        locale,
        messages: messages[locale],
        timeZone: defaultTimeZone,
    }
})
