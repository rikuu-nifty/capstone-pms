import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { PageProps } from '@inertiajs/core';
import { Link, usePage } from '@inertiajs/react';

import { Bell, LogOut, Settings, User } from 'lucide-react';

// ✅ Notification typing (make fields optional to support system notifications)
type NotificationData = {
    asset_id?: number;
    asset_name?: string;
    maintenance_due_date?: string;
    due_date?: string;
    message?: string;
    module?: string;
};

export type Notification = {
    id: string;
    data: NotificationData;
    read_at: string | null;
    status: 'unread' | 'read' | 'archived';
    created_at: string;
};

export interface SharedData extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
        } | null;
    };
    notifications: {
        items: Notification[];
        unread_count: number;
    };
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData & { auth: { permissions: string[] } }>();

    const auth = page.props.auth;
    const user = auth?.user;

    // ✅ SAFE fallback if notifications is not shared yet
    const notifications = page.props.notifications ?? {
        items: [],
        unread_count: 0,
    };

    const canViewNotifications = auth?.permissions?.includes('view-notifications') ?? false;

    // ✅ Helpers to avoid "Invalid Date" and show proper labels
    const isValidDate = (value?: string) => {
        if (!value) return false;
        const d = new Date(value);
        return !Number.isNaN(d.getTime());
    };

    const getDueDateText = (n: Notification) => {
        const due = n.data?.maintenance_due_date || n.data?.due_date;
        if (!isValidDate(due)) return null;

        return new Date(due as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isApprovalNeeded = (n: Notification) => {
        const msg = (n.data?.message || '').toLowerCase();
        const module = (n.data?.module || '').toLowerCase();

        return msg.includes('approval') || msg.includes('approval is required') || module.includes('approval');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6 transition-[width,height] ease-linear md:px-4">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-15">
                {/* User Profile Section */}
                <div>
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 rounded-full px-3 hover:bg-accent">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>
                                            {user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="hidden max-w-[200px] flex-col items-start text-left sm:flex">
                                        <p className="w-full truncate text-sm leading-none font-medium text-foreground">{user.name}</p>
                                        <p className="w-full truncate text-xs leading-tight text-muted-foreground">{user.email}</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex max-w-[200px] flex-col space-y-1 text-left">
                                        <p className="w-full truncate text-sm leading-none font-medium text-foreground">{user.name}</p>
                                        <p className="w-full truncate text-xs leading-tight text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* Profile Link */}
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route().has('profile.edit') ? route('profile.edit') : '#'}
                                        className="flex cursor-pointer items-center hover:bg-accent"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>

                                {/* Settings Link */}
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route().has('password.edit') ? route('password.edit') : '#'}
                                        className="flex cursor-pointer items-center hover:bg-accent"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Logout Link */}
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route().has('logout') ? route('logout') : '#'}
                                        method="post"
                                        as="button"
                                        className="flex w-full cursor-pointer items-center text-red-600 hover:bg-accent hover:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-red-600" />
                                        <span className="text-red-600">Logout</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Notification Section */}
                {canViewNotifications && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
                            >
                                <Bell className="h-5 w-5" />
                                {notifications.unread_count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {notifications.unread_count}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="max-h-96 w-96 overflow-y-auto rounded-xl shadow-lg" align="end">
                            {/* Header */}
                            <div className="flex items-center justify-between rounded-t-xl border-b bg-muted px-4 py-2">
                                <span className="text-sm font-semibold text-foreground">Notifications</span>
                                {notifications.unread_count > 0 && (
                                    <Link
                                        href={route('notifications.markAllRead')}
                                        method="post"
                                        as="button"
                                        className="cursor-pointer text-xs text-blue-600 hover:underline"
                                    >
                                        Mark all as read
                                    </Link>
                                )}
                            </div>

                            {!notifications?.items || notifications.items.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.items.map((n) => {
                                        const dueText = getDueDateText(n);
                                        const approvalNeeded = isApprovalNeeded(n);

                                        return (
                                            <DropdownMenuItem key={n.id} asChild>
                                                <div className="group relative flex w-full items-start gap-3 px-4 py-3 transition hover:bg-accent">
                                                    {/* ✅ LEFT (retain your original label style) */}
                                                    <Link href={route('notifications.index')}>
                                                        <Button variant="ghost" className="flex cursor-pointer items-center gap-2 hover:bg-accent">
                                                            <Bell className="h-4 w-4" />
                                                            Notifications
                                                        </Button>
                                                    </Link>

                                                    {/* ✅ RIGHT (better content, no invalid date) */}
                                                    <div className="flex-1">
                                                        <Link
                                                            href={route('notifications.read', n.id)}
                                                            method="post"
                                                            as="button"
                                                            className="w-full text-left"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <p
                                                                    className={`truncate text-sm font-medium ${
                                                                        n.read_at === null ? 'text-foreground' : 'text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {approvalNeeded ? 'Approval Needed' : 'Maintenance Needed'}
                                                                </p>
                                                            </div>
                                                            {/* Show message only for approval */}
                                                            {approvalNeeded && n.data?.message && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.data.message}</p>
                                                            )}

                                                            {/* For maintenance, show asset name instead of raw message */}
                                                            {!approvalNeeded && n.data?.asset_name && (
                                                                <p className="mt-1 text-xs text-muted-foreground">Asset: {n.data.asset_name}</p>
                                                            )}

                                                            {/* show due date only if valid */}
                                                            {dueText && <p className="mt-1 text-xs text-muted-foreground/80">Due Date: {dueText}</p>}
                                                        </Link>
                                                    </div>

                                                    {/* Dismiss */}
                                                    <Link
                                                        href={route('notifications.dismiss', n.id)}
                                                        method="post"
                                                        as="button"
                                                        className="absolute top-1/2 right-3 hidden -translate-y-1/2 cursor-pointer rounded-md bg-red-100 px-2 py-1 text-xs text-red-600 transition group-hover:flex hover:bg-red-200"
                                                    >
                                                        Dismiss
                                                    </Link>
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Footer link */}
                            <div className="border-t bg-background px-4 py-2">
                                <Link href={route('notifications.index')} className="text-xs font-medium text-blue-600 hover:underline">
                                    View all notifications
                                </Link>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
