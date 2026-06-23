import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/modules/shared/i18n/request.ts')

const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            'src/**/*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    env: {
        APP_NAME: process.env.APP_NAME,
        APP_LOCALE: process.env.APP_LOCALE,
        API_URL: process.env.API_URL,
    },
}

export default withNextIntl(nextConfig)
