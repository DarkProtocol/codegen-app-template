import { createTheme } from '@mantine/core'

export const theme = createTheme({
    primaryColor: 'indigo',
    defaultRadius: 'sm',
    components: {
        Button: {
            defaultProps: {
                type: 'button',
                radius: 'sm',
                size: 'md',
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
            },
        },
        PasswordInput: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
            },
        },
        Fieldset: {
            defaultProps: {
                radius: 'lg',
                variant: 'filled',
            },
        },
        Select: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
                comboboxProps: {
                    withinPortal: true,
                    zIndex: 1400,
                },
            },
        },
        Modal: {
            defaultProps: {
                centered: true,
                radius: 'md',
                zIndex: 1200,
            },
            styles: {
                title: {
                    fontWeight: 700,
                },
            },
        },
        Card: {
            defaultProps: {
                radius: 'md',
                padding: 'lg',
                withBorder: true,
            },
        },
        ThemeIcon: {
            defaultProps: {
                radius: 'md',
                variant: 'light',
            },
        },
        ActionIcon: {
            defaultProps: {
                radius: 'md',
            },
        },
        Tooltip: {
            defaultProps: {
                withArrow: true,
            },
        },
    },
})
