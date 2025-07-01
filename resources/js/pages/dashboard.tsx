import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">

                {/* Welcome Header */}
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Welcome Back!</h1>

                {/* Quick Stats Section */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active Transfers</h2>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">12</p>
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10 pointer-events-none" /> */}
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Pending Requests</h2>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">7</p>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10 pointer-events-none" />
                    </div>
                        
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Completed This Month</h2>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">24</p>
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10 pointer-events-none" /> */}
                    </div>
                </div>

                {/* Activity Feed or Placeholder Area */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border p-4">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Recent Activity</h2>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20 pointer-events-none" />
                </div>
            </div>
        </AppLayout>
    );
}
