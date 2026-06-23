'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Group, Text, ThemeIcon, Title } from '@mantine/core'
import { ArrowLeft, Home, Radar, SearchX } from 'lucide-react'
import { useTranslations } from 'next-intl'

import styles from './not-found.module.scss'

export default function NotFound() {
    const t = useTranslations('Shared.NotFound')
    const router = useRouter()
    const appName = process.env.APP_NAME ?? ''

    return (
        <main className={styles.notFound}>
            <div className={styles.notFound__shell}>
                <div className={styles.notFound__brand}>{appName}</div>

                <section className={styles.notFound__content} aria-labelledby="not-found-title">
                    <div className={styles.notFound__copy}>
                        <Text className={styles.notFound__eyebrow}>{t('eyebrow')}</Text>
                        <Title id="not-found-title" className={styles.notFound__title} order={1}>
                            {t('title')}
                        </Title>
                        <Text className={styles.notFound__description}>{t('description')}</Text>

                        <Group className={styles.notFound__actions} gap="sm">
                            <Button component={Link} href="/" leftSection={<Home size={18} strokeWidth={1.9} />}>
                                {t('home')}
                            </Button>
                            <Button
                                color="gray"
                                leftSection={<ArrowLeft size={18} strokeWidth={1.9} />}
                                variant="light"
                                onClick={() => router.back()}
                            >
                                {t('back')}
                            </Button>
                        </Group>
                    </div>

                    <div className={styles.notFound__visual} aria-hidden="true">
                        <div className={styles.notFound__visualHeader}>
                            <span className={styles.notFound__status}>{t('routeStatus')}</span>
                            <span className={styles.notFound__dots}>
                                <span />
                                <span />
                                <span />
                            </span>
                        </div>

                        <div className={styles.notFound__visualBody}>
                            <div className={styles.notFound__code}>
                                <span>4</span>
                                <span className={styles.notFound__zero}>
                                    <SearchX className={styles.notFound__zeroIcon} size={42} strokeWidth={1.8} />
                                </span>
                                <span>4</span>
                            </div>

                            <div className={styles.notFound__routeLine}>
                                <span className={styles.notFound__routePill} />
                                <span>{t('routeHint')}</span>
                                <ThemeIcon color="indigo" size={28} variant="light">
                                    <Radar size={16} strokeWidth={1.9} />
                                </ThemeIcon>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
