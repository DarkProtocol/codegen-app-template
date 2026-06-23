import {
    Badge,
    Button,
    Card,
    Group,
    Progress,
    RingProgress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core'
import { ArrowRight, ListChecks, Settings, ShieldCheck, Sparkles, UserPlus, UsersRound } from 'lucide-react'

import styles from './styles.module.scss'

const metrics = [
    {
        icon: UsersRound,
        value: '24',
        label: 'Admin users',
    },
    {
        icon: ShieldCheck,
        value: '3',
        label: 'Access roles',
    },
    {
        icon: UserPlus,
        value: '5',
        label: 'Pending invites',
    },
] as const

const trendPoints = ['30,78', '86,52', '142,62', '198,28', '254,44', '310,18'] as const
const barValues = [62, 78, 54, 88, 70, 96, 82] as const

const quickActions = [
    {
        icon: UserPlus,
        title: 'Create admin',
        description: 'Add a new user with administrative access.',
    },
    {
        icon: ListChecks,
        title: 'Review users',
        description: 'Check the admin user list and role assignments.',
    },
    {
        icon: Settings,
        title: 'Security settings',
        description: 'Review core policies before rolling out sections.',
    },
] as const

export function Dashboard() {
    return (
        <Stack className={styles.dashboard} gap="xl">
            <Card className={styles.hero} radius="md" padding="xl" withBorder>
                <Group align="flex-start" justify="space-between" gap="lg">
                    <Stack gap="xs">
                        <Badge color="indigo" variant="light">
                            Admin workspace
                        </Badge>
                        <Title order={1} className={styles.hero__title}>
                            Welcome to the admin panel
                        </Title>
                        <Text className={styles.hero__description}>
                            Core metrics, quick actions, and administrative section status will be collected here.
                        </Text>
                    </Stack>

                    <ThemeIcon className={styles.hero__icon} color="indigo" variant="light" radius="md" size={56}>
                        <Sparkles size={28} strokeWidth={1.8} />
                    </ThemeIcon>
                </Group>
            </Card>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {metrics.map((metric) => {
                    const Icon = metric.icon

                    return (
                        <Card key={metric.label} radius="md" padding="lg" withBorder>
                            <Group justify="space-between" wrap="nowrap">
                                <Stack gap={4}>
                                    <Text className={styles.metric__label}>{metric.label}</Text>
                                    <Text className={styles.metric__value}>{metric.value}</Text>
                                </Stack>

                                <ThemeIcon color="indigo" variant="light" radius="md" size={44}>
                                    <Icon size={22} strokeWidth={1.9} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    )
                })}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Card radius="md" padding="lg" withBorder>
                    <Stack gap="lg">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={4}>
                                <Title order={2} className={styles.sectionTitle}>
                                    Admin activity
                                </Title>
                                <Text className={styles.chart__description}>
                                    Sample action trend for the last 7 days.
                                </Text>
                            </Stack>

                            <Badge color="green" variant="light">
                                +18%
                            </Badge>
                        </Group>

                        <div className={styles.chart__line}>
                            <svg viewBox="0 0 340 110" role="img" aria-label="Admin activity">
                                <polyline className={styles.chart__lineGrid} points="0,86 340,86" />
                                <polyline className={styles.chart__lineGrid} points="0,54 340,54" />
                                <polyline className={styles.chart__lineGrid} points="0,22 340,22" />
                                <polyline className={styles.chart__linePath} points={trendPoints.join(' ')} />
                                {trendPoints.map((point) => {
                                    const [cx, cy] = point.split(',')

                                    return (
                                        <circle key={point} className={styles.chart__linePoint} cx={cx} cy={cy} r="4" />
                                    )
                                })}
                            </svg>
                        </div>

                        <Group className={styles.chart__bars} align="flex-end" gap={8} wrap="nowrap">
                            {barValues.map((value) => (
                                <div key={value} className={styles.chart__bar} style={{ height: `${value}%` }} />
                            ))}
                        </Group>
                    </Stack>
                </Card>

                <Card radius="md" padding="lg" withBorder>
                    <Stack gap="lg">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={4}>
                                <Title order={2} className={styles.sectionTitle}>
                                    Security status
                                </Title>
                                <Text className={styles.chart__description}>
                                    Draft snapshot for policies and role coverage.
                                </Text>
                            </Stack>

                            <RingProgress
                                size={92}
                                thickness={9}
                                roundCaps
                                sections={[{ value: 76, color: 'indigo' }]}
                                label={
                                    <Text ta="center" fw={700} size="sm">
                                        76%
                                    </Text>
                                }
                            />
                        </Group>

                        <Stack gap="sm">
                            <Group justify="space-between" wrap="nowrap">
                                <Text className={styles.chart__label}>Password policy</Text>
                                <Text className={styles.chart__value}>92%</Text>
                            </Group>
                            <Progress value={92} color="indigo" radius="xl" />

                            <Group justify="space-between" wrap="nowrap">
                                <Text className={styles.chart__label}>Role coverage</Text>
                                <Text className={styles.chart__value}>68%</Text>
                            </Group>
                            <Progress value={68} color="teal" radius="xl" />
                        </Stack>
                    </Stack>
                </Card>
            </SimpleGrid>

            <Card radius="md" padding="lg" withBorder>
                <Stack gap="md">
                    <Title order={2} className={styles.sectionTitle}>
                        Quick start
                    </Title>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                        {quickActions.map((action) => {
                            const Icon = action.icon

                            return (
                                <Card key={action.title} className={styles.action} radius="md" padding="md" withBorder>
                                    <Stack gap="md">
                                        <ThemeIcon color="indigo" variant="light" radius="md" size={38}>
                                            <Icon size={20} strokeWidth={1.9} />
                                        </ThemeIcon>
                                        <Stack gap={4}>
                                            <Text className={styles.action__title}>{action.title}</Text>
                                            <Text className={styles.action__description}>{action.description}</Text>
                                        </Stack>
                                        <Button
                                            variant="light"
                                            color="indigo"
                                            rightSection={<ArrowRight size={16} strokeWidth={1.9} />}
                                        >
                                            Open
                                        </Button>
                                    </Stack>
                                </Card>
                            )
                        })}
                    </SimpleGrid>
                </Stack>
            </Card>
        </Stack>
    )
}
