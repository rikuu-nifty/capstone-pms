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
    ClipboardList,
    Network,
    Building2,
    Blocks,
    Files,
    FileCheck2,
    Package2,
    CalendarCheck2,
    LayoutGrid,
    PackageCheck,
    Settings,
    User,
    ArrowRightLeft,
    Calendar,
    School,
    File,
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
    { title: 'Off-campus', href: '/off-campus', icon: School },
    { title: 'Reports', href: '/reports', icon: Files },
];

const assetsNavItems = [
    { title: 'Categories', href: '/categories', icon: Blocks },
    { title: 'Models', href: '/models', icon: PackageCheck },
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

const configNavItems = [
    { title: 'Settings', href: '/settings', icon: Settings },
];

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
                {/* Group: Dashboard */}
                <NavMain items={dashboardNavItems}>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                </NavMain>

                {/* Group: Inventory */}
                <NavMain items={inventoryNavItems}>
                    <SidebarGroupLabel>Inventory</SidebarGroupLabel>
                </NavMain>

                {/* Group: Assets */}
                <NavMain items={assetsNavItems}>
                    <SidebarGroupLabel>Assets</SidebarGroupLabel>
                </NavMain>

                {/* Group: Institutional Setup */}
                <NavMain items={institutionalSetUpNavItems}>
                    <SidebarGroupLabel>Institutional Setup</SidebarGroupLabel>
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
