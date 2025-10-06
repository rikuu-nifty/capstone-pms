import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Notification {
    id: string;
    data: {
        asset_name?: string;
        maintenance_due_date?: string;
        message?: string;
    };
    status: 'unread' | 'read' | 'archived';
    read_at: string | null;
    created_at: string;
}

interface NotificationsPageProps {
    notifications: {
        data: Notification[];
        links: { url: string | null; label: string; active: boolean }[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filter: string;
    counts: {
        all: number;
        unread: number;
        archived: number;
    };
}

export default function NotificationsIndex({ notifications, filter, counts }: NotificationsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

    const handleTabChange = (type: string) => {
        router.get(route('notifications.index'), { filter: type }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                        <p className="text-sm text-muted-foreground">View all system notifications and maintenance alerts</p>
                    </div>
                </div>

                {/* ✅ Tab Bar with Counts */}
                <div className="flex gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-900">
                    {[
                        { key: 'all', label: 'All', count: counts.all },
                        { key: 'unread', label: 'Unread', count: counts.unread },
                        { key: 'archived', label: 'Archived', count: counts.archived },
                    ].map((t) => (
                        <Button
                            key={t.key}
                            variant={filter === t.key ? 'default' : 'ghost'}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                                filter === t.key ? 'font-semibold shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleTabChange(t.key)}
                        >
                            {t.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    filter === t.key ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {t.count}
                            </span>
                        </Button>
                    ))}
                </div>

                {/* ✅ Card-style Notifications */}
                <div className="space-y-3">
                    {notifications.data.length > 0 ? (
                        notifications.data.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-900 ${
                                    n.status === 'unread' ? 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                {/* Message Section */}
                                <div className="flex flex-col">
                                    <p
                                        className={`text-sm ${
                                            n.status === 'unread' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {n.data.asset_name ?? 'System Notification'}
                                    </p>
                                    <p className="text-xs text-gray-500">{n.data.message}</p>
                                    {n.data.maintenance_due_date && (
                                        <p className="text-xs text-gray-400">
                                            Due:{' '}
                                            {new Date(n.data.maintenance_due_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>

                                {/* Date + Actions */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs whitespace-nowrap text-gray-500">
                                        {new Date(n.created_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </span>

                                    <div className="flex gap-2">
                                        {n.status === 'unread' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.post(route('notifications.read', n.id), {}, { preserveScroll: true, preserveState: false })
                                                }
                                            >
                                                Mark as Read
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        route('notifications.unread', n.id),
                                                        {},
                                                        { preserveScroll: true, preserveState: false },
                                                    )
                                                }
                                            >
                                                Mark as Unread
                                            </Button>
                                        )}

                                        {n.status !== 'archived' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        route('notifications.archive', n.id),
                                                        {},
                                                        { preserveScroll: true, preserveState: false },
                                                    )
                                                }
                                            >
                                                Archive
                                            </Button>
                                        )}

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(route('notifications.destroy', n.id), {
                                                    preserveScroll: true,
                                                    preserveState: false,
                                                })
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-md border bg-gray-50 py-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            No notifications found for this filter.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
