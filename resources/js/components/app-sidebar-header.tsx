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

// Notification typing
type NotificationData = {
    asset_id: number;
    asset_name: string;
    maintenance_due_date: string;
    message: string;
};

export type Notification = {
    id: string;
    data: NotificationData;
    read_at: string | null;
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
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const { notifications } = page.props; // no extra cast needed

    // Debug log here
    console.log('🔔 Notifications', notifications);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 transition-[width,height] ease-linear md:px-4">
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
                                <Button variant="ghost" className="flex items-center gap-3 rounded-full px-3 hover:bg-gray-100">
                                    <Avatar className="h-8 w-8 border border-gray-300">
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
                                        <p className="truncate text-sm leading-none font-medium text-gray-900 w-full">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs leading-tight text-muted-foreground w-full">
                                            {user.email}
                                        </p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex max-w-[200px] flex-col space-y-1 text-left">
                                        <p className="truncate text-sm leading-none font-medium text-gray-900 w-full">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs leading-tight text-muted-foreground w-full">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* Profile Link */}
                                <DropdownMenuItem asChild>
                                    <Link href={route().has('profile.edit') ? route('profile.edit') : '#'} className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>

                                {/* Settings Link */}
                                <DropdownMenuItem asChild>
                                    <Link href={route().has('settings') ? route('settings') : '#'} className="flex items-center">
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
                                        className="flex items-center text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Notification Section */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100"
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
                        <div className="flex items-center justify-between rounded-t-xl border-b bg-gray-50 px-4 py-2">
                            <span className="text-sm font-semibold text-gray-800">Notifications</span>
                            {notifications.unread_count > 0 && (
                                <Link
                                    href={route('notifications.markAllRead')}
                                    method="post"
                                    as="button"
                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                >
                                    Mark all as read
                                </Link>
                            )}
                        </div>
                        {!notifications?.items || notifications.items.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                            <div className="divide-y">
                                {notifications.items.map((n) => (
                                    <DropdownMenuItem key={n.id} asChild>
                                        <div className="group relative flex w-full items-start gap-3 px-4 py-3 transition hover:bg-gray-50">
                                            {/* Icon */}
                                            <Link href={route('notifications.index')}>
                                                <Button variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-blue-100">
                                                    <Bell className="h-4 w-4" />
                                                    Notifications
                                                </Button>
                                            </Link>

                                            {/* Text */}
                                            <div className="flex-1">
                                                <Link
                                                    href={route('notifications.read', n.id)} // 👈 backend marks it read
                                                    method="post"
                                                    as="button"
                                                    className="w-full text-left"
                                                >
                                                    <p
                                                        className={`truncate text-sm font-medium ${
                                                            n.read_at === null ? 'text-gray-900' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {n.data.asset_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Due Date:{' '}
                                                        {new Date(n.data.maintenance_due_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </Link>
                                            </div>

                                            {/* Slide-to-remove / Dismiss button */}
                                            <Link
                                                href={route('notifications.dismiss', n.id)}
                                                method="post"
                                                as="button"
                                                className="cursor-pointer absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md bg-red-100 px-2 py-1 text-xs text-red-600 transition group-hover:flex hover:bg-red-200"
                                            >
                                                Dismiss
                                            </Link>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
