const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string) {
    return EMAIL_REGEXP.test(value.trim())
}
