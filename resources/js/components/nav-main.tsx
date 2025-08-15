import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

type Mode = 'flat' | 'collapsible';

type BaseProps = {
    items: NavItem[];
    children?: ReactNode; // usually <SidebarGroupLabel>...</SidebarGroupLabel>
    groupIcon?: React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
    className?: string;
};

export function NavMain(props: BaseProps & { mode?: Mode }) {
    const { mode = 'flat', ...rest } = props;
    return mode === 'collapsible' ? <NavMainCollapsible {...rest} /> : <NavMainFlat {...rest} />;
}

/* --------- FLAT (keeps your original look) --------- */
function NavMainFlat({ items, children, className }: Pick<BaseProps, 'items' | 'children' | 'className'>) {
    const { url } = usePage();
    return (
        <SidebarGroup className={cn('px-2 py-0', className)}>
            {children}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={url.startsWith(item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

/* --------- COLLAPSIBLE (Inventory, Assets, Institutional Setup, User) --------- */
function NavMainCollapsible({ items, children, groupIcon: GroupIcon, defaultOpen, className }: BaseProps) {
    const { url } = usePage();
    const anyActive = useMemo(() => items.some((i) => url.startsWith(i.href)), [items, url]);
    const [open, setOpen] = useState<boolean>(defaultOpen ?? anyActive);
    const FirstIcon = GroupIcon ?? items[0]?.icon;

    return (
        <SidebarGroup className={cn('px-2 py-0', className)}>
            <SidebarMenu>
                <SidebarMenuItem>
                    {/* HEADER: plain button; no font/size overrides */}
                    <SidebarMenuButton
  type="button"
  className={cn("w-full", anyActive && "bg-muted")}
  onClick={() => setOpen(v => !v)}
  aria-expanded={open}
>
  {FirstIcon ? <FirstIcon className="h-4 w-4" /> : null}
  {/* ✅ plain span, not SidebarGroupLabel */}
  <span>{children}</span>
  <ChevronDown
    className={cn(
      "ml-auto h-4 w-4 transition-transform",
      open ? "rotate-180" : "rotate-0"
    )}
  />
</SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>

            {open && (
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => {
                            const active = url.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={active} tooltip={{ children: item.title }}>
                                        <Link href={item.href} prefetch>
                                            {Icon && <Icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
            )}
        </SidebarGroup>
    );
}
