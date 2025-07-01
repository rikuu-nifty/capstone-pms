import AppLayout from '@/layouts/app-layout';
    import { type BreadcrumbItem } from '@/types';
    import { Head } from '@inertiajs/react';
    

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Calendar',
            href: '/calendar',
        },
    ];

export default function CalendarPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Calendar
                </h1>

                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                        July 1, 2025
                    </h2>

                    {/* Static Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 text-center text-sm text-neutral-600 dark:text-neutral-300">
                        {/* Days of the week headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="font-medium">
                                {day}
                            </div>
                        ))}

                        {/* 5 weeks x 7 days = 35 cells */}
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-100/40 dark:bg-neutral-800/30 flex items-center justify-center"
                            >
                                {i + 1 <= 31 ? i + 1 : ''}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
