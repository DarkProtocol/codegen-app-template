export const DASHBOARD_PATH = '/'
export const LOGIN_PATH = '/login'

interface NavigationRouter {
    replace(path: string): void
    refresh(): void
}

export function toDashboard(router: NavigationRouter) {
    router.replace(DASHBOARD_PATH)
}

export function toLogin(router: Pick<NavigationRouter, 'replace'>) {
    router.replace(LOGIN_PATH)
}

export function isLoginPath(pathname: string) {
    return pathname === LOGIN_PATH
}

export function isDashboardPath(pathname: string) {
    return !isLoginPath(pathname)
}
