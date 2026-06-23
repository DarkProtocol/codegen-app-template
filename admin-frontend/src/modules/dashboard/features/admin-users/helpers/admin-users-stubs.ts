import type { AdminUser } from '@modules/dashboard/models/admin-users-api.interface'

export const adminUsers: AdminUser[] = [
    {
        id: 'usr_001',
        email: 'dark@example.com',
        firstName: 'Dark',
        lastName: 'Protocol',
        role: 'admin',
        createdAt: '2026-04-08T00:00:00+00:00',
        updatedAt: '2026-04-08T00:00:00+00:00',
        bannedAt: null,
    },
    {
        id: 'usr_002',
        email: 'anna.admin@example.com',
        firstName: 'Anna',
        lastName: 'Admin',
        role: 'admin',
        createdAt: '2026-04-19T00:00:00+00:00',
        updatedAt: '2026-04-19T00:00:00+00:00',
        bannedAt: null,
    },
    {
        id: 'usr_003',
        email: 'editor.one@example.com',
        firstName: 'Editor',
        lastName: 'One',
        role: 'editor',
        createdAt: '2026-06-02T00:00:00+00:00',
        updatedAt: '2026-06-02T00:00:00+00:00',
        bannedAt: null,
    },
    {
        id: 'usr_004',
        email: 'blocked.admin@example.com',
        firstName: 'Blocked',
        lastName: 'Admin',
        role: 'admin',
        createdAt: '2026-05-11T00:00:00+00:00',
        updatedAt: '2026-05-11T00:00:00+00:00',
        bannedAt: '2026-06-01T00:00:00+00:00',
    },
]
