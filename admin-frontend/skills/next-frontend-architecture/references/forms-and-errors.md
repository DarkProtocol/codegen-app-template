# Forms and Errors

Forms are built on **@mantine/form** (`useForm`). There is **no React Hook Form and no Zod** anywhere in this app. Validation messages come from **next-intl**, and API field errors are bridged into the form by a single shared hook. Do not reach for `form.setError`, `{ type: 'server' }`, `Path<T>`, `register`, `useController`, a `resolver`, or a `schema.ts` — none of those concepts exist here.

## 1. API Error Shape

The backend error contract is a single optional flat `field -> message` map. Cite `src/modules/shared/models/api-error-response.interface.ts`:

```ts
type ErrorMap = Record<string, string>

export interface IApiErrorResponse {
    errors?: ErrorMap
}
```

That is the whole contract. There is no `error`, `fields`, or `statusCode`. Field errors map onto matching form fields; unmatched keys (and any global message) go to the synthetic `'root'` field. If a real API response does not fit this shape, treat it as a backend contract issue rather than adding endpoint-specific frontend parsing.

## 2. Form Setup with @mantine/form

Canonical shape: a module-scope `FormValues` type and an `initialValues` object, then `useForm<FormValues>({ initialValues, validate, transformValues })`. Cite `src/modules/auth/features/login-form/index.tsx`.

```tsx
import { useForm } from '@mantine/form'
import { useTranslations } from 'next-intl'
import { isValidEmail } from '@modules/shared/helpers/validation'

type LoginFormValues = {
    email: string
    password: string
}

const initialValues: LoginFormValues = {
    email: '',
    password: '',
}

const sharedT = useTranslations('Shared.Validation')

const form = useForm<LoginFormValues>({
    initialValues,
    validate: {
        email: (value) => {
            if (value.trim().length === 0) {
                return sharedT('requiredField')
            }
            return isValidEmail(value) ? null : sharedT('invalidEmail')
        },
        password: (value) => (value.length > 0 ? null : sharedT('requiredField')),
    },
    transformValues: (values) => ({
        email: values.email.trim(),
        password: values.password,
    }),
})
```

Rules:

- **Validators are per-field functions** returning `null` when valid, or a translated message string when invalid.
- **Cross-field validation** uses the second `(value, values)` argument. Cite `src/modules/dashboard/features/admin-users/components/change-password/index.tsx`:

  ```tsx
  confirmPassword: (value, values) => {
      if (value.length === 0) {
          return sharedT('requiredField')
      }
      return value === values.newPassword ? null : sharedT('passwordsDoNotMatch')
  },
  ```

- **`transformValues` trims inputs** (and passes passwords through untouched) so the submitted payload is normalized.
- **Bind standard Mantine inputs** by spreading `{...form.getInputProps('field')}`:

  ```tsx
  <EmailInput required {...form.getInputProps('email')} />
  <PasswordInput required {...form.getInputProps('password')} />
  ```

- **Bind custom Selects manually** (they do not consume `getInputProps`) via explicit `value` / `error` / `onChange` -> `setFieldValue`. Cite `src/modules/dashboard/features/admin-users/components/create/index.tsx` with `AdminUserRoleSelect`:

  ```tsx
  <AdminUserRoleSelect
      required
      roles={roles}
      value={form.values.role}
      error={form.errors.role}
      onChange={(value) => form.setFieldValue('role', value)}
  />
  ```

- **Always render `<form noValidate onSubmit={form.onSubmit(handler)}>`** (or `<Paper component="form" noValidate ...>` as in the login form). `noValidate` disables native browser validation so Mantine owns it.

## 3. Validation messages

All messages come from **next-intl**, read via `sharedT = useTranslations('Shared.Validation')` and returned directly from validators. The available keys live in `src/modules/shared/i18n/shared-messages.ts`:

```ts
Validation: {
    requiredField: 'Required field',
    invalidEmail: 'Invalid email',
    passwordMinLength: 'Minimum 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
}
```

The **only** extracted validation helper is `src/modules/shared/helpers/validation.ts`:

```ts
const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string) {
    return EMAIL_REGEXP.test(value.trim())
}
```

Everything else (required checks, min-length, equality) is an inline arrow function inside `validate`. There is no Zod, no shared `schema.ts`, no per-feature `models/schema.ts` / `models/types.ts`.

## 4. Mapping API errors into the form

API errors are pushed into the Mantine form by the shared hook `useApiFormErrors(form, error)`. It is typed against `UseFormReturnType<T>`, accepts the union of RTK Query / serialized / raw API errors, unwraps RTK's `FetchBaseQueryError` (whose body sits under `data`), then routes each `errors[field]` to a matching field via `setFieldError`, sending unmatched keys and any global message to `'root'`, with a next-intl fallback. Paste from `src/modules/shared/hooks/use-api-form-errors.ts`:

```ts
import { useEffect } from 'react'
import type { UseFormReturnType } from '@mantine/form'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useTranslations } from 'next-intl'
import type { IApiErrorResponse } from '@modules/shared/models/api-error-response.interface'

type ApiFormError = FetchBaseQueryError | SerializedError | IApiErrorResponse
type ApiFormValues = Record<string, unknown>
type ApiFormField<T extends ApiFormValues> = keyof T & string

export function useApiFormErrors<T extends ApiFormValues>(form: UseFormReturnType<T>, error: ApiFormError | undefined) {
    const t = useTranslations('Shared.Errors')
    const { getValues, setFieldError } = form

    useEffect(() => {
        if (!error) return

        const fallbackMessage = t('somethingWentWrong')

        const setFormFieldError = (field: ApiFormField<T> | 'root', message: string) => {
            setFieldError(field as ApiFormField<T>, message)
        }

        if (typeof error !== 'object' || error === null) {
            setFormFieldError('root', String(error) || fallbackMessage)
            return
        }

        let apiError: IApiErrorResponse | null = null
        if ('data' in error && isApiErrorResponse(error.data)) {
            apiError = error.data
        } else if (isApiErrorResponse(error)) {
            apiError = error
        }

        if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
            const values = getValues()

            Object.entries(apiError.errors).forEach(([field, message]) => {
                if (!message) return

                if (field in values) {
                    setFormFieldError(field as ApiFormField<T>, message)
                } else {
                    setFormFieldError('root', message)
                }
            })
            return
        }

        const message = 'message' in error && error.message ? error.message : fallbackMessage
        setFormFieldError('root', message)
    }, [error, getValues, setFieldError, t])
}

function isApiErrorResponse(error: unknown): error is IApiErrorResponse {
    return isObject(error) && 'errors' in error && isErrorMap(error.errors)
}

function isErrorMap(errors: unknown): errors is NonNullable<IApiErrorResponse['errors']> {
    if (!isObject(errors) || Array.isArray(errors)) {
        return false
    }
    return Object.values(errors).every((message) => typeof message === 'string')
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
```

Wire it once per form by passing the RTK mutation's `error` straight through; it re-runs whenever that error changes:

```tsx
const [login, { isLoading: isSubmitting, error: loginError, reset: resetLogin }] = useLoginMutation()

useApiFormErrors(form, loginError)
```

Key behaviors to preserve: unwrap via `'data' in error`, guard with `isApiErrorResponse`, match by `field in values`, route the rest to `'root'`, fall back to `t('somethingWentWrong')` from `Shared.Errors`, and keep the effect deps `[error, getValues, setFieldError, t]`.

## 5. Global / root errors

Non-field (global) errors are stored on the synthetic `form.errors.root` and rendered by the shared `<FormRootError />`, placed between the inputs and the submit button. It is a Mantine `Text` with `role="alert"` that returns `null` when empty. Cite `src/modules/shared/components/form-root-error/index.tsx`:

```tsx
import { Text, type TextProps } from '@mantine/core'
import type { ReactNode } from 'react'

type Props = Omit<TextProps, 'children'> & {
    error: ReactNode
}

export function FormRootError({ error, ...props }: Props) {
    if (!error) {
        return null
    }

    return (
        <Text c="var(--mantine-color-error)" fz={13} fw={600} lh={1.35} role="alert" {...props}>
            {error}
        </Text>
    )
}
```

Usage:

```tsx
<FormRootError error={form.errors.root} />
```

## 6. Submit ritual

Every submit handler follows the same shape. Cite `src/modules/dashboard/features/admin-users/components/create/index.tsx`:

```tsx
const handleSubmit = async (values: CreateAdminUserFormValues) => {
    form.clearErrors()
    resetCreateAdminUser()

    try {
        await createAdminUser({
            firstName: values.firstName,
            lastName: values.lastName || null,
            email: values.email,
            password: values.password,
            role: values.role as AdminUserRole,
        }).unwrap()
        handleClose()
        onCreated()
        notifications.show({
            color: 'teal',
            title: t('Create.successTitle'),
            message: t('Create.successMessage'),
        })
    } catch {
        // Field and root errors are mapped by useApiFormErrors.
    }
}
```

Steps:

1. **Top:** `form.clearErrors()` + `reset<Mutation>()` (clear stale field/root errors and the previous RTK error so the next failure re-fires `useApiFormErrors`).
2. **Try:** `await mutation(values).unwrap()`.
3. **Success:** run side effects (close modal, reload data, `onCreated()/onSuccess()`), then `notifications.show({ color: 'teal', title, message })` and `form.reset()` / reload as appropriate.
4. **Catch:** intentionally **empty** — errors are handled reactively by `useApiFormErrors` reacting to the mutation's `error`. The comment `// Field and root errors are mapped by useApiFormErrors.` documents this.

**Login-form exception:** the auth login flow has no per-field API errors for bad credentials, so its `catch` manually surfaces a message. Cite `src/modules/auth/features/login-form/index.tsx`:

```tsx
} catch (error) {
    const apiErrors = (error as IApiErrorResponse).errors
    if (apiErrors && Object.keys(apiErrors).length > 0) {
        return
    }
    const errorMessage = t('invalidCredentials')
    form.setFieldError('email', errorMessage)
}
```

If the backend returned a field map, defer to `useApiFormErrors`; otherwise set a translated `invalidCredentials` message on the `email` field.

## 7. Loading / disabled and modal lifecycle

Derive submit state from the RTK mutation tuple — destructure `{ isLoading: isSubmitting, error, reset }` — and drive the Button with `loading={isSubmitting}`. Disable conditionally (e.g. `disabled={!form.values.name.trim()}` or `disabled={roles.length === 0}`).

**Modal close.** `handleClose` resets the form, resets the RTK mutation, and calls `onClose`; guard against closing mid-submit. Cite `src/modules/dashboard/features/media-library/components/create-folder-modal/index.tsx`:

```tsx
const isSubmitting = isCreating || isReloading

const handleClose = () => {
    if (isSubmitting) {
        return
    }
    form.reset()
    resetCreateFolder()
    onClose()
}
```

Note the composite busy flag (`isCreating || isReloading`) when post-submit work (a folder reload) extends the busy window beyond the mutation itself.

**Seeding an edit-existing form.** When initial values come from server state, seed via a `useEffect` that calls `setInitialValues` + `setValues` + `resetDirty` + `clearErrors` (destructured from `form` for stable deps). Cite `src/modules/dashboard/features/settings/components/profile-form/index.tsx`:

```tsx
const { clearErrors, resetDirty, setInitialValues, setValues } = form

useEffect(() => {
    const userValues = {
        firstName: user.firstName,
        lastName: user.lastName ?? '',
    }

    setInitialValues(userValues)
    setValues(userValues)
    resetDirty(userValues)
    clearErrors()
}, [clearErrors, resetDirty, setInitialValues, setValues, user.firstName, user.lastName])
```

`setInitialValues` makes the seeded values the new baseline (so `form.reset()` returns to them), and `resetDirty` clears the dirty flag after seeding.

## 8. Shared input wrappers

Shared input wrappers are thin Mantine wrappers that add a lucide icon and a next-intl default label/placeholder, while forwarding the `getInputProps` output (`value`, `onChange`, `error`, etc.) through `...props`. Cite `src/modules/shared/components/email-input/index.tsx`:

```tsx
import { TextInput, type TextInputProps as MantineTextInputProps } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'

type Props = MantineTextInputProps & Omit<React.ComponentPropsWithoutRef<'input'>, keyof MantineTextInputProps>

export function EmailInput({ label, placeholder, type = 'email', leftSection, ...props }: Props) {
    const t = useTranslations('Shared.Components')

    return (
        <TextInput
            label={label ?? t('emailLabel')}
            placeholder={placeholder ?? t('emailPlaceholder')}
            type={type}
            leftSection={leftSection ?? <Mail size={18} strokeWidth={1.8} />}
            {...props}
        />
    )
}
```

`PasswordInput` (`src/modules/shared/components/password-input/index.tsx`) mirrors this over Mantine `PasswordInput` with the `LockKeyhole` icon. Defaults are overridable: a caller can pass its own `label`/`placeholder` (the wrappers only fall back to the `Shared.Components` translations when those props are absent), so the same wrapper serves both the auth login form and the admin-user create modal.
