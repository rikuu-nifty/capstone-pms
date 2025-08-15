import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Blocks,
    Building2,
    Calendar,
    CalendarCheck2,
    ClipboardList,
    File,
    FileCheck2,
    Files,
    LayoutGrid,
    Network,
    Package2,
    PackageCheck,
    School,
    Settings,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

// Grouped nav items
const dashboardNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Calendar', href: '/calendar', icon: Calendar },
];

const inventoryNavItems = [
    { title: 'Inventory List', href: '/inventory-list', icon: Package2 },
    { title: 'Inventory Scheduling', href: '/inventory-scheduling', icon: CalendarCheck2 },
    { title: 'Transfer', href: '/transfers', icon: ArrowRightLeft },
    { title: 'Turnover/Disposal', href: '/turnover-disposal', icon: ClipboardList },
    { title: 'Off-Campus', href: '/off-campus', icon: School },
    { title: 'Reports', href: '/reports', icon: Files },
];

const assetsNavItems = [
    { title: 'Categories', href: '/categories', icon: Blocks },
    // { title: 'Models', href: '/models', icon: PackageCheck },
    { title: 'Assignment', href: '/assignment', icon: PackageCheck },
];

const institutionalSetUpNavItems = [
    { title: 'Buildings', href: '/buildings', icon: Building2 },
    { title: 'Organizations', href: '/organizations', icon: Network },
];

const userNavItems = [
    { title: 'Audit Log', href: '/audit-log', icon: File },
    { title: 'Form Approval', href: '/form-approval', icon: FileCheck2 },
    { title: 'Profile', href: '/profile', icon: User },
];

const configNavItems = [{ title: 'Settings', href: '/settings', icon: Settings }];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="h-screen overflow-hidden">
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

            <SidebarContent className="overflow-hidden">
                {/* Dashboard — flat, unchanged */}
                <NavMain items={dashboardNavItems} mode="flat">
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                </NavMain>

                {/* Inventory — add mt-1 so it can't overlap Dashboard */}
                <NavMain items={inventoryNavItems} mode="collapsible">
                    Inventory
                </NavMain>

                <NavMain items={assetsNavItems} mode="collapsible">
                    Assets
                </NavMain>

                <NavMain items={institutionalSetUpNavItems} mode="collapsible">
                    Institutional Setup
                </NavMain>

                <NavMain items={userNavItems} mode="collapsible">
                    User
                </NavMain>
                {/* Configuration — flat, unchanged */}
                <NavMain items={configNavItems} mode="flat" className="mt-1">
                    <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                </NavMain>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
