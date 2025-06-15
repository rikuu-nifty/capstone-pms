import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    Cuboid,
    Folder,
    LayoutGrid,
    PackageCheck,
    Settings,
    User,
    ArrowRightLeft,
    Calendar,
    School
} from 'lucide-react';
import AppLogo from './app-logo';


// Define all nav groups
const mainNavItems = [
    { title: 'Inventory', href: '/inventory', icon: Cuboid },
];

const formsNavItems = [
    { title: 'Transfer', href: '/transfer', icon: ArrowRightLeft},
    { title: 'Turnover/Disposal', href: '/turnover-disposal', icon: ClipboardList },
    { title: 'Off-campus', href: '/off-campus', icon: School },
];

const othersNavItems = [
    { title: 'Assets Life Cycle', href: '/assetslifecycle', icon: PackageCheck },
    { title: 'Calendar', href: '/calendar', icon: Calendar },
];

const userNavItems = [
    { title: 'Profile', href: '/profile', icon: User },
];

const configNavItems = [
    { title: 'Settings', href: '/settings', icon: Settings },
];

const footerNavItems = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Standalone Dashboard */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={window.location.pathname === '/dashboard'}
                            tooltip={{ children: 'Dashboard' }}
                        >
                            <Link href="/dashboard" prefetch>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Group: Platform */}
                <NavMain
                    items={mainNavItems}
                >
                    <SidebarGroupLabel>Finance & Storage </SidebarGroupLabel>
                </NavMain>

                {/* Group: Forms */}
                <NavMain items={formsNavItems}>
                    <SidebarGroupLabel>Forms</SidebarGroupLabel>
                </NavMain>

                {/* Group: Others */}
                <NavMain items={othersNavItems}>
                    <SidebarGroupLabel>Others</SidebarGroupLabel>
                </NavMain>

                {/* Group: User */}
                <NavMain items={userNavItems}>
                    <SidebarGroupLabel>User</SidebarGroupLabel>
                </NavMain>

                {/* Group: Configuration */}
                <NavMain items={configNavItems}>
                    <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                </NavMain>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
