export const sharedMessages = {
    ru: {
        Components: {
            emailLabel: 'Email',
            emailPlaceholder: 'admin@example.com',
            passwordLabel: 'Пароль',
            passwordPlaceholder: 'Введите пароль',
            CopyInput: {
                copy: 'Скопировать',
                copied: 'Скопировано',
            },
        },
        Validation: {
            requiredField: 'Обязательное поле',
            invalidEmail: 'Неверный email',
            passwordMinLength: 'Минимум 6 символов',
            passwordsDoNotMatch: 'Пароли не совпадают',
        },
        Notification: {
            internalErrorTitle: 'Внутренняя ошибка',
            internalErrorMessage: 'Пожалуйста, свяжитесь с нами',
        },
        ConfirmModal: {
            title: 'Подтвердить действие',
            message: 'Вы уверены, что хотите выполнить это действие?',
            cancel: 'Отмена',
            confirm: 'Подтвердить',
        },
        Errors: {
            somethingWentWrong: 'Что-то пошло не так',
        },
        NotFound: {
            eyebrow: 'Ошибка 404',
            title: 'Страница потерялась',
            description:
                'Маршрут не найден или был удален. Проверьте адрес, вернитесь назад или откройте главную страницу панели.',
            home: 'На главную',
            back: 'Назад',
            routeStatus: 'Route scanner',
            routeHint: 'route_not_found',
        },
    },
    en: {
        Components: {
            emailLabel: 'Email',
            emailPlaceholder: 'admin@example.com',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter password',
            CopyInput: {
                copy: 'Copy',
                copied: 'Copied',
            },
        },
        Validation: {
            requiredField: 'Required field',
            invalidEmail: 'Неверный email',
            passwordMinLength: 'Minimum 6 characters',
            passwordsDoNotMatch: 'Passwords do not match',
        },
        Notification: {
            internalErrorTitle: 'Internal error',
            internalErrorMessage: 'Please contact us',
        },
        ConfirmModal: {
            title: 'Confirm action',
            message: 'Are you sure you want to perform this action?',
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
        Errors: {
            somethingWentWrong: 'Something went wrong',
        },
        NotFound: {
            eyebrow: 'Error 404',
            title: 'This page got lost',
            description:
                'The route was not found or has been removed. Check the address, go back, or open the panel home page.',
            home: 'Go home',
            back: 'Back',
            routeStatus: 'Route scanner',
            routeHint: 'route_not_found',
        },
    },
} as const

export type SharedLocale = keyof typeof sharedMessages

export const defaultLocale: SharedLocale = 'en'
