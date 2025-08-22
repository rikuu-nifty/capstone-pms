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
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Blocks,
    Calendar,
    CalendarCheck2,
    Building2,
    ChevronRight,
    ClipboardList,
    File,
    FileCheck2,
    Files,
    Landmark,
    LayoutGrid,
    Network,
    Package2,
    PackageCheck,
    School,
    Settings,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';

// ------------------ NAV ITEMS ------------------
const dashboardNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Calendar', href: '/calendar', icon: Calendar },
];

const inventoryNavItems = [
    { title: 'Inventory List', href: '/inventory-list', icon: Package2 },
    { title: 'Inventory Scheduling', href: '/inventory-scheduling', icon: CalendarCheck2 },
    { title: 'Transfer', href: '/transfers', icon: ArrowRightLeft },
    { title: 'Turnover/Disposal', href: '/turnover-disposal', icon: ClipboardList },
    { title: 'Off Campus', href: '/off-campus', icon: School },
    { title: 'Reports', href: '/reports', icon: Files },
];

const assetsNavItems = [
    { title: 'Categories', href: '/categories', icon: Blocks },
    { title: 'Models', href: '/models', icon: PackageCheck },
    { title: 'Assignment', href: '/assignment', icon: PackageCheck },
];

const institutionalSetUpNavItems = [
    { title: 'Buildings', href: '/buildings', icon: Landmark },
    { title: 'Organizations', href: '/unit-or-departments', icon: Network },
];

const userNavItems = [
    { title: 'Audit Log', href: '/audit-log', icon: File },
    { title: 'Form Approval', href: '/approvals', icon: FileCheck2 },
    { title: 'Profile', href: '/profile', icon: User },
];

const configNavItems = [{ title: 'Settings', href: '/settings', icon: Settings }];

// ------------------ COMPONENT ------------------
export function AppSidebar() {
    const { url } = usePage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Auto-open groups that contain the active route
    useEffect(() => {
        if (inventoryNavItems.some((item) => url.startsWith(item.href))) {
            setOpenGroups((prev) => ({ ...prev, Inventory: true }));
        }
        if (assetsNavItems.some((item) => url.startsWith(item.href))) {
            setOpenGroups((prev) => ({ ...prev, Assets: true }));
        }
        if (institutionalSetUpNavItems.some((item) => url.startsWith(item.href))) {
            setOpenGroups((prev) => ({ ...prev, 'Institutional Setup': true }));
        }
        if (userNavItems.some((item) => url.startsWith(item.href))) {
            setOpenGroups((prev) => ({ ...prev, User: true }));
        }
    }, [url]);

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const renderCollapsible = (
        label: string,
        Icon: React.ComponentType<{ className?: string }>,
        items: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[],
    ) => {
        const isOpen = openGroups[label] ?? false;

        return (
            <SidebarMenuItem>
                {/* Parent button (aligned with Dashboard/Calendar) */}
                <SidebarMenuButton
                    onClick={() => toggleGroup(label)}
                    className="flex items-center rounded-md px-3 py-2 transition-colors space-x-2"
                >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform duration-300 ${
                            isOpen ? 'rotate-90' : ''
                        }`}
                    />
                </SidebarMenuButton>

                {/* Submenu */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild className="pl-8">
                                    <Link href={item.href} className="flex items-center space-x-1">
                                        <item.icon/>
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </SidebarMenuItem>
        );
    };

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
                <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                <SidebarMenu>
                    {/* Flat items (Dashboard, Calendar) */}
                    {dashboardNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild className="px-3 py-2">
                                <Link href={item.href} className="flex items-center space-x-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}

                    {/* Collapsible groups */}
                    {renderCollapsible('Inventory', Package2, inventoryNavItems)}
                    {renderCollapsible('Assets', Blocks, assetsNavItems)}
                    {renderCollapsible('Institutional Setup', Building2, institutionalSetUpNavItems)}
                    {renderCollapsible('User', User, userNavItems)}
                </SidebarMenu>

                {/* Configuration section */}
                <div className="mt-1">
                    <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                    <SidebarMenu>
                        {configNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild className="px-3 py-2">
                                    <Link href={item.href} className="flex items-center space-x-2">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
