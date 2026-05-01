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
    Bell,
    Blocks, // optional icon for "System Monitoring"
    BookOpenCheck,
    Building2,
    Calendar,
    CalendarCheck2,
    ChartColumnIncreasing,
    ChevronRight,
    ClipboardList,
    FileCheck2,
    FileDigit,
    FileText,
    FileUser,
    Landmark,
    LayoutGrid,
    Monitor,
    Network,
    Package2,
    PackageCheck,
    School,
    Settings,
    ShieldCheck,
    Trash2,
    User,
    UserCheck2,
    UserCircle, // optional icon for "System Monitoring"
} from 'lucide-react';

import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
// import { permission } from 'process';

// ------------------ TYPES ------------------
type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<Record<string, unknown>>;
    permission?: string | string[];
};

// ------------------ NAV ITEMS ------------------
const dashboardNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Calendar', href: '/calendar', icon: Calendar, permission: 'view-calendar' },
];

const reportsNavItem = {
    title: 'Reports',
    href: '/reports',
    icon: ChartColumnIncreasing,
    permission: 'view-reports',
};

const notificationsNavItem = {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    permission: 'view-notifications',
};

const auditLogItem = {
    title: 'Audit Trail',
    href: '/audit-log',
    icon: FileText,
    permission: 'view-audit-logs',
};

const trashBinItem = {
    title: 'Trash Bin',
    href: '/trash-bin',
    icon: Trash2,
    permission: 'view-trash-bin',
};

const systemMonitoringNavItems = [notificationsNavItem, reportsNavItem, trashBinItem, auditLogItem];

const assetsNavItems = [
    { title: 'Categories', href: '/categories', icon: Blocks, permission: 'view-categories' },
    { title: 'Equipment Codes', href: '/equipment-codes', icon: FileDigit, permission: 'view-equipment-codes' },
    { title: 'Models', href: '/models', icon: PackageCheck, permission: 'view-asset-models' },
    { title: 'Assignments', href: '/assignments', icon: FileUser, permission: 'view-assignments' },
];

const userNavItems = [
    { title: 'Users', href: '/users', icon: UserCheck2, permission: 'view-users-page' },
    { title: 'Roles', href: '/role-management', icon: ShieldCheck, permission: 'view-roles-page' },
    { title: 'Form Approval', href: '/approvals', icon: FileCheck2, permission: 'view-form-approvals' },
    { title: 'Signatories', href: '/signatories', icon: FileUser, permission: 'view-signatories' },
];

const configNavItems = [
    { title: 'Profile', href: '/settings/profile', icon: User, permission: 'view-profile' },
    { title: 'Settings', href: '/settings/password', icon: Settings },
];

// ------------------ HELPERS ------------------
function canView(item: NavItem, permissions: string[]): boolean {
    if (!item.permission) return true;
    if (Array.isArray(item.permission)) {
        return item.permission.some((p) => permissions.includes(p));
    }
    return permissions.includes(item.permission);
}

const hasVisibleItems = (items: NavItem[], permissions: string[]) => items.some((item) => canView(item, permissions));

const hasVisibleGroups = (groups: NavItem[][], permissions: string[]) => groups.some((items) => hasVisibleItems(items, permissions));

const normalizePath = (path: string) => path.split('?')[0].replace(/\/+$/, '') || '/';

const isActivePath = (currentUrl: string, href: string) => {
    const current = normalizePath(currentUrl);
    const target = normalizePath(href);

    return current === target || current.startsWith(`${target}/`);
};

// ------------------ COMPONENT ------------------
export function AppSidebar() {
    const page = usePage<{
        auth: { permissions: string[] };
        nav_metrics?: {
            pending_user_approvals?: number;
        };
    }>();
    const permissions = page.props.auth?.permissions ?? [];
    const pendingApprovals = page.props.nav_metrics?.pending_user_approvals ?? 0;

    const { url } = usePage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Dynamic Inventory link based on permissions
    const inventoryListLink = permissions.includes('view-inventory-list')
        ? '/inventory-list'
        : permissions.includes('view-own-unit-inventory-list')
          ? '/inventory-list/own'
          : null;

    // Inventory menu items
    const inventoryNavItems: NavItem[] = [
        ...(inventoryListLink
            ? [
                  {
                      title: 'Inventory List',
                      href: inventoryListLink,
                      icon: Package2,
                      permission: ['view-inventory-list', 'view-own-unit-inventory-list'],
                  } as NavItem,
              ]
            : []),
        {
            title: 'Inventory Scheduling',
            href: '/inventory-scheduling',
            icon: CalendarCheck2,
            permission: 'view-inventory-scheduling',
        },
        { title: 'Property Transfer', href: '/transfers', icon: ArrowRightLeft, permission: 'view-transfers' },
        { title: 'Turnover/Disposal', href: '/turnover-disposal', icon: ClipboardList, permission: 'view-turnover-disposal' },
        { title: 'Off-Campus', href: '/off-campus', icon: School, permission: 'view-off-campus' },
        { title: 'Verification Form', href: '/verification-form', icon: BookOpenCheck, permission: 'view-verification-form' },
        // { title: 'Verification Form', href: '/verification-form', icon: BookOpenCheck },
    ];

    const buildingsLink = permissions.includes('view-buildings')
        ? '/buildings'
        : permissions.includes('view-own-unit-buildings')
          ? '/buildings/own'
          : null;

    const institutionalSetUpNavItems = [
        ...(buildingsLink
            ? [
                  {
                      title: 'Buildings',
                      href: buildingsLink,
                      icon: Landmark,
                      permission: ['view-buildings', 'view-own-unit-buildings'],
                  } as NavItem,
              ]
            : []),
        { title: 'Personnels', href: '/personnels', icon: User, permission: 'view-personnels' },
        { title: 'Units & Departments', href: '/unit-or-departments', icon: Network, permission: 'view-unit-or-departments' },
    ];

    useEffect(() => {
        if (inventoryNavItems.some((item) => isActivePath(url, item.href))) {
            setOpenGroups((prev) => ({ ...prev, Inventory: true }));
        }
        if (assetsNavItems.some((item) => isActivePath(url, item.href))) {
            setOpenGroups((prev) => ({ ...prev, Assets: true }));
        }
        if (institutionalSetUpNavItems.some((item) => isActivePath(url, item.href))) {
            setOpenGroups((prev) => ({ ...prev, 'Institutional Setup': true }));
        }
        if (userNavItems.some((item) => isActivePath(url, item.href))) {
            setOpenGroups((prev) => ({ ...prev, 'User Management': true }));
        }
        if (systemMonitoringNavItems.some((item) => isActivePath(url, item.href))) {
            setOpenGroups((prev) => ({ ...prev, 'System Monitoring': true }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        items: { title: string; href: string; icon: React.ComponentType<{ className?: string }>; permission?: string | string[] }[],
    ) => {
        const visibleItems = items.filter((item) => canView(item, permissions));
        if (visibleItems.length === 0) return null;

        const groupActive = visibleItems.some((item) => isActivePath(url, item.href));
        const isOpen = openGroups[label] ?? groupActive;

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => toggleGroup(label)}
                    isActive={groupActive}
                    className="flex items-center space-x-2 rounded-md px-3 py-2 transition-colors"
                >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                </SidebarMenuButton>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <SidebarMenu>
                        {visibleItems.map((item) => (
                            <SidebarMenuButton key={item.href} asChild isActive={isActivePath(url, item.href)} className="pl-8">
                                <Link href={item.href} className="flex w-full items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </div>

                                    {/* Pending badge (visible only for Users) */}
                                    {item.title === 'Users' && pendingApprovals > 0 && (
                                        <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                                            {pendingApprovals}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </div>
            </SidebarMenuItem>
        );
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="flex h-screen flex-col">
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

            <SidebarContent className="flex-1 overflow-y-auto">
                {/* MAIN PLATFORM */}

                {hasVisibleItems(dashboardNavItems, permissions) && (
                    <>
                        <SidebarGroupLabel>Main Platform</SidebarGroupLabel>
                        <SidebarMenu>
                            {dashboardNavItems
                                .filter((item) => canView(item, permissions))
                                .map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild isActive={isActivePath(url, item.href)} className="px-3 py-2">
                                            <Link href={item.href} className="flex items-center space-x-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                        </SidebarMenu>
                    </>
                )}

                {/* PROPERTY MANAGEMENT */}
                {hasVisibleGroups([inventoryNavItems, assetsNavItems, institutionalSetUpNavItems], permissions) && (
                    <>
                        <div className="mt-1">
                            <SidebarGroupLabel>Property Management</SidebarGroupLabel>
                            <SidebarMenu>
                                {renderCollapsible('Inventory', Package2, inventoryNavItems)}
                                {renderCollapsible('Assets', Blocks, assetsNavItems)}
                                {renderCollapsible('Institutional Setup', Building2, institutionalSetUpNavItems)}
                            </SidebarMenu>
                        </div>
                    </>
                )}

                {/* ADMINISTRATION */}
                {hasVisibleGroups([userNavItems, systemMonitoringNavItems], permissions) && (
                    <>
                        <div className="mt-1">
                            <SidebarGroupLabel>Administration</SidebarGroupLabel>
                            <SidebarMenu>
                                {renderCollapsible('User Management', UserCircle, userNavItems)}
                                {/* NEW COLLAPSIBLE GROUP: System Monitoring */}
                                {renderCollapsible('System Monitoring', Monitor, systemMonitoringNavItems)}
                            </SidebarMenu>
                        </div>
                    </>
                )}

                {/* CONFIGURATION */}
                {hasVisibleItems(configNavItems, permissions) && (
                    <>
                        <div className="mt-1">
                            <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                            <SidebarMenu>
                                {configNavItems
                                    .filter((item) => canView(item, permissions))
                                    .map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={isActivePath(url, item.href)} className="px-3 py-2">
                                                <Link href={item.href} className="flex items-center space-x-2">
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                            </SidebarMenu>
                        </div>
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
