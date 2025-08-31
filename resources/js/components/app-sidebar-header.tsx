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
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, LogOut, Settings, User } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

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
                                        <AvatarImage src={user.avatar || '/default-avatar.png'} alt={user.name} />
                                        <AvatarFallback>
                                            {user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden max-w-[150px] flex-col items-start text-left sm:flex">
                                        <p className="truncate text-sm leading-none font-medium">{user.name}</p>
                                        <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex max-w-[200px] flex-col space-y-1">
                                        <p className="truncate text-sm leading-none font-medium">{user.name}</p>
                                        <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
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
                <div className="relative">
                    <Button
                        variant="ghost"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
