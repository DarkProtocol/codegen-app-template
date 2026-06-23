'use client'

import { Burger, Drawer } from '@mantine/core'
import { useClickOutside, useCollapse } from '@mantine/hooks'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Menu } from '../menu'
import styles from './styles.module.scss'

export function MobileMenu() {
    const t = useTranslations('Dashboard.Menu')
    const [isOpen, setIsOpen] = useState(false)
    const [triggerNode, setTriggerNode] = useState<HTMLButtonElement | null>(null)
    const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)
    const { getCollapseProps } = useCollapse({
        expanded: isOpen,
        transitionDuration: 180,
        transitionTimingFunction: 'ease',
    })

    useClickOutside(() => setIsOpen(false), null, [triggerNode, contentNode], isOpen)

    return (
        <div className={styles.mobileMenu} data-open={isOpen}>
            <Burger
                ref={setTriggerNode}
                className={styles.mobileMenu__trigger}
                opened={isOpen}
                aria-label={isOpen ? t('closeMenu') : t('openMenu')}
                color="var(--mantine-color-dark-7)"
                lineSize={2}
                size="sm"
                onClick={() => setIsOpen((value) => !value)}
            />

            <Drawer
                opened={isOpen}
                onClose={() => setIsOpen(false)}
                withCloseButton={false}
                position="left"
                size="100%"
                zIndex={1000}
                overlayProps={{ backgroundOpacity: 0 }}
                transitionProps={{ transition: 'fade', duration: 180, timingFunction: 'ease' }}
                classNames={{
                    content: styles.mobileMenu__drawerContent,
                    body: styles.mobileMenu__drawerBody,
                }}
            >
                <div {...getCollapseProps({ ref: setContentNode })} className={styles.mobileMenu__content}>
                    <Menu onNavigate={() => setIsOpen(false)} />
                </div>
            </Drawer>
        </div>
    )
}
