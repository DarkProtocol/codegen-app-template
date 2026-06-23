# UI and Mantine

Mantine v9 is the **primary UI library**. Every shared/module component is a thin wrapper over Mantine
primitives. Custom CSS, SCSS modules, and lucide-react sit on top of Mantine — never instead of it.

Pins: `@mantine/core` / `@mantine/hooks` / `@mantine/form` / `@mantine/notifications` / `@mantine/nprogress`
/ `@mantine/dropzone` `^9.3.x`, `lucide-react` `^1`, Next.js `^16`, React `^19`.

## 1. Mantine is primary — wrap, don't hand-roll

Use Mantine primitives for everything: `Button`, `Modal`, `TextInput`, `PasswordInput`, `Select`, `Table`,
`Card`, `Menu`, `Popover`, `ActionIcon`, `ThemeIcon`, `AppShell`, `Breadcrumbs`, `Loader`, `Skeleton`,
`Group`, `Stack`, `Center`, `Pagination`, `ScrollArea`, `Tooltip`, `Chip`, `Checkbox`, `Input`.

Hard rules:

- Never hand-roll a `Button`, `Modal`, or spinner.
- **There is no custom `Spinner`.** Loading uses Mantine `Loader` (`type="bars"`), `Skeleton`, and the
  `loading` prop on `Button`.
- A "shared component" is a Mantine primitive plus project defaults (i18n labels, locked props, an icon).
  See `src/modules/shared/components/email-input/index.tsx` — it is just `<TextInput>` with a default
  label, placeholder, and `<Mail>` left section.

## 2. Theme — `src/modules/shared/theme.ts`

Global design tokens and per-component defaults live in one `createTheme(...)` call. Configure defaults
**here**, not at each call site.

```ts
// src/modules/shared/theme.ts
import { createTheme } from '@mantine/core'

export const theme = createTheme({
    primaryColor: 'indigo',
    defaultRadius: 'sm',
    components: {
        Button: { defaultProps: { type: 'button', radius: 'sm', size: 'md' } },
        TextInput: { defaultProps: { radius: 'sm', size: 'md' } },
        PasswordInput: { defaultProps: { radius: 'sm', size: 'md' } },
        Fieldset: { defaultProps: { radius: 'lg', variant: 'filled' } },
        Select: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
                comboboxProps: { withinPortal: true, zIndex: 1400 },
            },
        },
        Modal: {
            defaultProps: { centered: true, radius: 'md', zIndex: 1200 },
            styles: { title: { fontWeight: 700 } },
        },
        Card: { defaultProps: { radius: 'md', padding: 'lg', withBorder: true } },
        ThemeIcon: { defaultProps: { radius: 'md', variant: 'light' } },
        ActionIcon: { defaultProps: { radius: 'md' } },
        Tooltip: { defaultProps: { withArrow: true } },
    },
})
```

Applied once in `src/modules/shared/provider.tsx` via `<MantineProvider theme={theme}>`.

**z-index ladder** (set across theme + provider + components — keep overlays stacked correctly):

| Layer                | z-index | Where set                                                 |
| -------------------- | ------- | --------------------------------------------------------- |
| Menu dropdown        | 1100    | `DashboardTable` `<Menu zIndex={1100}>`                   |
| Modal                | 1200    | `theme.ts` `Modal.defaultProps.zIndex`                    |
| Notifications outlet | 1300    | `provider.tsx` `<Notifications zIndex={1300}>`            |
| Select combobox      | 1400    | `theme.ts` `Select.defaultProps.comboboxProps.zIndex`     |

Select sits above Modal so dropdowns inside modals are never clipped. Add a new global default to
`theme.ts`; reach for a per-call `zIndex` only for a genuine one-off (e.g. a tooltip over a notification).

## 3. App bootstrap — `src/app/layout.tsx`

Mantine CSS must be imported in this exact order, **before** `globals.scss`, plus `ColorSchemeScript` and
`mantineHtmlProps`:

```tsx
// src/app/layout.tsx
import '@mantine/core/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/notifications/styles.css'
import '@/styles/globals.scss'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import { getAppLocale, messages } from '@modules/shared/i18n/messages'
import { Provider as SharedProvider } from '@modules/shared/provider'
import { Provider as AuthProvider } from '@modules/auth'

const defaultColorScheme = 'light'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const appLocale = getAppLocale()

    return (
        <html lang={appLocale} {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme={defaultColorScheme} />
            </head>
            <body>
                <SharedProvider
                    defaultColorScheme={defaultColorScheme}
                    locale={appLocale}
                    messages={messages[appLocale]}
                >
                    <AuthProvider>{children}</AuthProvider>
                </SharedProvider>
            </body>
        </html>
    )
}
```

`SharedProvider` (`src/modules/shared/provider.tsx`) wires Redux → next-intl → Mantine in that nesting,
plus the `RouteProgress` and `Notifications` outlets:

```tsx
<BaseProvider store={store}>
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
        <MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
            <RouteProgress />
            {children}
            <Notifications position="bottom-right" autoClose={3500} zIndex={1300} />
        </MantineProvider>
    </NextIntlClientProvider>
</BaseProvider>
```

## 4. Component prop typing convention

Extend the Mantine `*Props`, then `Omit` the props your wrapper locks down so callers cannot override
behavior.

**Add behavior, keep all props** — intersect with native element props:

```tsx
// src/modules/shared/components/password-input/index.tsx
type Props = MantinePasswordInputProps &
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof MantinePasswordInputProps>
```

**Lock behavior** — `Omit` the props the wrapper owns (`CopyInput` is read-only, owns its `rightSection`
and `value`):

```tsx
// src/modules/shared/components/copy-input/index.tsx
type Props = Omit<
    MantineTextInputProps,
    'disabled' | 'readOnly' | 'rightSection' | 'rightSectionPointerEvents' | 'value'
> & { value: string; copyLabel?: string; copiedLabel?: string }
```

**Polymorphic with `next/link`** — `DashboardCreateButton` `Omit`s `children` / `color` / `leftSection`
(it always renders teal with a `<Plus>`) and switches to `Link` when `href` is passed:

```tsx
// src/modules/dashboard/components/create-button/index.tsx
type DashboardCreateButtonBaseProps = ButtonProps &
    React.ComponentPropsWithoutRef<'button'> & { component?: ElementType; href?: string }

type Props = Omit<DashboardCreateButtonBaseProps, 'children' | 'color' | 'leftSection'> & {
    children?: ReactNode
}

const Component = Button as ElementType<DashboardCreateButtonBaseProps>
// <Component component={href ? Link : props.component} href={href} color="teal" ... />
```

## 5. Real components

**Shared** (`src/modules/shared/components/*`):

| Component       | Wraps                                | Notes                                               |
| --------------- | ------------------------------------ | --------------------------------------------------- |
| `ConfirmModal`  | `Modal` + `Button` ×2                | i18n defaults, `confirmColor`, `loading`            |
| `CopyInput`     | `TextInput` + `ActionIcon`/`Tooltip` | read-only, copy button via `useCopy`                |
| `EmailInput`    | `TextInput`                          | default label/placeholder + `<Mail>` left section   |
| `PasswordInput` | `PasswordInput`                      | default label/placeholder + `<LockKeyhole>`         |
| `FormRootError` | `Text`                               | renders `form.errors.root`, `c="var(--mantine-color-error)"` |
| `RouteProgress` | `NavigationProgress`                 | route loading bar (section 8)                        |

`ConfirmModal` shape (`src/modules/shared/components/confirm-modal/index.tsx`):

```tsx
<Modal opened={opened} onClose={onClose} title={modalTitle} size="sm">
    <Stack gap="lg">
        <Text c="dark.9" size="sm">{modalMessage}</Text>
        <Group justify="flex-end">
            <Button variant="subtle" color="gray" disabled={loading} onClick={onClose}>{cancel}</Button>
            <Button color={confirmColor} loading={loading} onClick={onConfirm}>{confirm}</Button>
        </Group>
    </Stack>
</Modal>
```

**Module** (`src/modules/dashboard/components/*`):

- `DashboardTable` — generic `Table` + `ScrollArea` + `Pagination` (`usePagination`) + per-row `Menu`.
  Renders `Skeleton` rows while loading and an empty state. Columns/menu items are typed:
  `DashboardTableColumn<T>` and a `DashboardTableRowMenuItem` union (`button | link | text | divider`).
  See `src/modules/dashboard/components/table/index.tsx`.
- `DashboardPageHeader` — `Stack`/`Group`/`Title` + optional `Breadcrumbs` and a `createAction`
  (link or button) rendered via `DashboardCreateButton`.
- `DashboardCreateButton` — section 4.
- `MediaLibraryFileSelect` — a **`Popover` picker over existing media files** (folders + files, breadcrumb
  navigation, search, single/multi). It is **not an uploader**; uploading is the Dropzone modal in section 9.
  Built from `Input.Wrapper` + `Popover` + `ScrollArea.Autosize` + `ThemeIcon`/`Checkbox`. See
  `src/modules/dashboard/components/media-library-file-select/index.tsx`.

## 6. Icons — lucide-react first

Import named icons from `lucide-react`; render with `size` + `strokeWidth`; type dynamic icons as
`LucideIcon`. Place icons in Mantine slots (`leftSection`, `rightSection`, `separator`) or wrap in
`ThemeIcon`.

```tsx
import { Plus, EllipsisVertical, type LucideIcon } from 'lucide-react'

<Button leftSection={<Plus size={18} strokeWidth={1.9} />}>{label}</Button>
<ActionIcon variant="subtle" color="gray"><EllipsisVertical size={18} strokeWidth={1.9} /></ActionIcon>

const fileTypeIcons: Record<string, LucideIcon> = { image: Image, video: Video, pdf: FileText }
```

Custom SVG-as-React-component is a **fallback** (`@svgr/webpack`, typed by `src/types/svg.d.ts`) and is
currently unused in `src`. Details in [env-and-assets.md](./env-and-assets.md).

## 7. Notifications — `@mantine/notifications`

Fire imperatively with `notifications.show(...)`; `color: 'teal'` for success, `'red'` for error. **There
is no Redux notification slice/state.** The single `<Notifications/>` outlet lives in
`shared/provider.tsx`.

```tsx
import { notifications } from '@mantine/notifications'

notifications.show({ color: 'teal', title: t('BanConfirm.unbanSuccessTitle'), message: t('...Message') })
```

Use translated `title`/`message` (`useTranslations('Shared.Notification')` for generic fallbacks).
Example: `src/modules/dashboard/features/admin-users/components/ban-confirm/index.tsx`.

The only data-layer notification is the **global HTTP 500 toast** fired inside the base query
(`src/modules/shared/helpers/rtk-query.ts`) — do not duplicate it per request.

## 8. Route progress — `@mantine/nprogress`

`RouteProgress` (`src/modules/shared/components/route-progress/index.tsx`) renders
`<NavigationProgress color="indigo" size={3} />` and is mounted once in `shared/provider.tsx`. It
intercepts same-origin anchor clicks (capture-phase listener) to `nprogress.start()`, then completes on
the next `usePathname()` change. App Router has no built-in bar, so this component supplies it — do not add
a competing one.

## 9. File upload — `@mantine/dropzone`

Uploading uses `<Dropzone>` with `Accept` / `Reject` / `Idle` slots, wired to `@mantine/form`. This is
**distinct** from `MediaLibraryFileSelect` (section 5), which only picks files that already exist.

```tsx
// src/modules/dashboard/features/media-library/components/create-file-modal/index.tsx
import { Dropzone } from '@mantine/dropzone'

<Dropzone
    accept={supportedExtensions}
    maxSize={config?.maxFileSize}
    multiple={false}
    onDrop={handleDrop}
    onReject={handleReject}
>
    <Dropzone.Accept><Check color="var(--mantine-color-teal-6)" size={36} /></Dropzone.Accept>
    <Dropzone.Reject><X color="var(--mantine-color-red-6)" size={36} /></Dropzone.Reject>
    <Dropzone.Idle><Upload color="var(--mantine-color-dimmed)" size={36} /></Dropzone.Idle>
    {/* ... */}
</Dropzone>
```

`onDrop` writes the file into the form (`form.setFieldValue('file', file)`); `onReject` sets a field error
(`form.setFieldError('file', ...)`). Validation lives in the `useForm` `validate` map. See
[forms-and-errors.md](./forms-and-errors.md).

## 10. Loading primitives

| Need                | Use                                                  | Example                                |
| ------------------- | ---------------------------------------------------- | -------------------------------------- |
| Full-page / gate    | `Loader` `type="bars"` inside `Center`               | `src/modules/auth/provider.tsx`        |
| Tables / lists      | `Skeleton`                                           | `DashboardTable`, `MediaLibraryFileSelect` |
| Submit button       | `<Button loading={isSubmitting}>`                    | login form, modals                     |

```tsx
// src/modules/auth/provider.tsx — full-page loader, no custom Spinner
<Center mih="100dvh" bg="gray.0">
    <Loader color="indigo" size="xl" type="bars" />
</Center>
```

## 11. i18n-first labels

Component text comes from next-intl `useTranslations`, with optional prop overrides falling back to the
translation key:

```tsx
const t = useTranslations('Shared.Components')
label={label ?? t('emailLabel')}
placeholder={placeholder ?? t('emailPlaceholder')}
```

Components routinely use several scoped translators (feature `t` + `Shared.Validation` + `Shared.Notification`).
Full conventions in [i18n.md](./i18n.md).

## 12. Styling Mantine alongside SCSS

Two layers coexist. Decision rule:

- **`theme.ts`** — global / per-component design defaults (section 2).
- **Mantine style props** (`h`, `w`, `p*`, `gap`, `justify`, `fw`, `ta`, `c`) — small one-off
  spacing/alignment.
- **SCSS module** (`styles.module.scss`) — custom layout/grid, borders, backgrounds, responsive, bespoke
  visuals.

Style Mantine internals via `classNames={{ part: styles.bemClass }}` (preferred) or the `:global(.mantine-*)`
escape hatch. SCSS color tokens are `var(--mantine-color-*)`, which is the SCSS↔Mantine bridge.

```tsx
<ScrollArea.Autosize classNames={{ viewport: styles.mediaLibraryFileSelect__scrollViewport }} />
```

```scss
// :global escape hatch, from table/styles.module.scss
:global(.mantine-Pagination-control) { width: 32px; height: 32px; }
```

Full token bridge, mixins, and BEM rules: [styles.md](./styles.md).
