import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { notifyFiltersCleared } from '@/lib/toast-feedback';
import type { BreadcrumbItem } from '@/types';
import type { EventClickArg } from '@fullcalendar/core';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import '@fullcalendar/daygrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/list';
import listPlugin from '@fullcalendar/list';
import '@fullcalendar/timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head } from '@inertiajs/react';
import {
    Archive,
    CalendarCheck2,
    CalendarClock,
    CalendarDays,
    ClipboardList,
    FileText,
    Filter,
    Search,
    Truck,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../../css/calendar-overrides.css';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    color: string;
    url?: string;
    type: string;
    status: string;
    allDay?: boolean;
}

interface CalendarProps {
    events: CalendarEvent[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calendar', href: '/calendar' }];

const MODULES = [
    {
        label: 'Inventory Scheduling',
        icon: CalendarDays,
        color: '#2563eb',
        tone: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
        label: 'Property Transfer',
        icon: Truck,
        color: '#16a34a',
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
        label: 'Off-Campus Issued',
        icon: ClipboardList,
        color: '#f59e0b',
        tone: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
        label: 'Off-Campus Return',
        icon: CalendarClock,
        color: '#eab308',
        tone: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    },
    {
        label: 'Turnover/Disposal',
        icon: Archive,
        color: '#9333ea',
        tone: 'bg-violet-50 text-violet-700 border-violet-100',
    },
    {
        label: 'Form Approval',
        icon: FileText,
        color: '#dc2626',
        tone: 'bg-rose-50 text-rose-700 border-rose-100',
    },
];

const COMPLETED_STATUS = ['approved', 'completed', 'done', 'returned', 'cancelled', 'canceled'];

function moduleFor(type: string) {
    return MODULES.find((module) => module.label === type) ?? MODULES[0];
}

function stripHtml(value: string) {
    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function parseDate(value?: string) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function isSameDay(a: Date, b: Date) {
    return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isWithinDays(date: Date, from: Date, days: number) {
    const start = startOfDay(from).getTime();
    const end = start + days * 24 * 60 * 60 * 1000;
    const target = startOfDay(date).getTime();
    return target >= start && target <= end;
}

function isOpenStatus(status: string) {
    const normalized = status.toLowerCase();
    return !COMPLETED_STATUS.some((item) => normalized.includes(item));
}

function formatDate(value?: string) {
    const date = parseDate(value);
    if (!date) return 'No date set';

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function formatStatus(status: string) {
    return status
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function statusTone(status: string) {
    const normalized = status.toLowerCase();

    if (normalized.includes('approved') || normalized.includes('completed') || normalized.includes('returned')) {
        return 'border-emerald-100 bg-emerald-50 text-emerald-700';
    }

    if (normalized.includes('pending') || normalized.includes('scheduled')) {
        return 'border-amber-100 bg-amber-50 text-amber-700';
    }

    if (normalized.includes('cancel') || normalized.includes('reject') || normalized.includes('overdue')) {
        return 'border-rose-100 bg-rose-50 text-rose-700';
    }

    return 'border-slate-200 bg-slate-50 text-slate-600';
}

export default function CalendarPage({ events }: CalendarProps) {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [activeModules, setActiveModules] = useState<string[]>(MODULES.map((module) => module.label));
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const eventCounts = useMemo(() => {
        return MODULES.reduce<Record<string, number>>((counts, module) => {
            counts[module.label] = events.filter((event) => event.type === module.label).length;
            return counts;
        }, {});
    }, [events]);

    const normalizedEvents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return events
            .map((event) => ({
                ...event,
                plainTitle: stripHtml(event.title),
            }))
            .filter((event) => {
                const matchesModule = activeModules.includes(event.type);
                const matchesSearch =
                    !query ||
                    event.plainTitle.toLowerCase().includes(query) ||
                    event.type.toLowerCase().includes(query) ||
                    event.status.toLowerCase().includes(query);

                return matchesModule && matchesSearch;
            });
    }, [activeModules, events, searchTerm]);

    const today = useMemo(() => new Date(), []);

    const metrics = useMemo(() => {
        const todayCount = events.filter((event) => {
            const date = parseDate(event.start);
            return date ? isSameDay(date, today) : false;
        }).length;

        const weekCount = events.filter((event) => {
            const date = parseDate(event.start);
            return date ? isWithinDays(date, today, 7) : false;
        }).length;

        const openCount = events.filter((event) => isOpenStatus(event.status)).length;

        return {
            total: events.length,
            today: todayCount,
            week: weekCount,
            open: openCount,
        };
    }, [events, today]);

    const upcomingEvents = useMemo(() => {
        const todayStart = startOfDay(today).getTime();

        return normalizedEvents
            .filter((event) => {
                const date = parseDate(event.start);
                return date ? startOfDay(date).getTime() >= todayStart : false;
            })
            .sort((a, b) => {
                const first = parseDate(a.start)?.getTime() ?? 0;
                const second = parseDate(b.start)?.getTime() ?? 0;
                return first - second;
            })
            .slice(0, 6);
    }, [normalizedEvents, today]);

    const calendarEvents = useMemo(() => {
        return normalizedEvents.map((event) => {
            const module = moduleFor(event.type);

            return {
                ...event,
                title: event.plainTitle,
                color: module.color,
                borderColor: module.color,
                backgroundColor: module.color,
                extendedProps: {
                    type: event.type,
                    status: event.status,
                    url: event.url,
                },
            };
        });
    }, [normalizedEvents]);

    useEffect(() => {
        if (!calendarRef.current) return;

        type CalendarElement = HTMLDivElement & { _calendarInstance?: FullCalendar };
        const calendarEl = calendarRef.current as CalendarElement;
        const existingCalendar = calendarEl._calendarInstance;
        const currentView = existingCalendar?.view?.type || 'dayGridMonth';
        const currentDate = existingCalendar?.getDate?.() || new Date();

        if (existingCalendar) {
            existingCalendar.destroy();
        }

        const calendar = new FullCalendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek',
            },
            buttonText: {
                today: 'Today',
                month: 'Month',
                week: 'Week',
                list: 'Agenda',
            },
            initialView: currentView,
            initialDate: currentDate,
            navLinks: true,
            events: calendarEvents,
            height: 'auto',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },
            dayMaxEventRows: 4,
            moreLinkText: 'more',
            slotMinTime: '08:00:00',
            slotMaxTime: '17:01:00',
            scrollTime: '08:00:00',
            scrollTimeReset: false,
            expandRows: true,
            slotLabelInterval: '1:00',
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
                hour12: true,
            },
            views: {
                dayGridMonth: { displayEventTime: false },
                timeGridWeek: { displayEventTime: false },
                timeGridDay: { displayEventTime: false },
            },
            eventContent: (arg) => {
                const type = String(arg.event.extendedProps.type ?? '');
                const status = String(arg.event.extendedProps.status ?? '');

                return {
                    html: `
                        <div class="tt-event">
                            <span class="tt-event-title">${escapeHtml(arg.event.title)}</span>
                            <span class="tt-event-meta">${escapeHtml(type)}${status ? ` - ${escapeHtml(formatStatus(status))}` : ''}</span>
                        </div>
                    `,
                };
            },
            eventClick: (info: EventClickArg) => {
                info.jsEvent.preventDefault();
                if (info.event.url) window.open(info.event.url, '_blank');
            },
            datesSet: () => {
                const allDayLabel = document.querySelector('.fc-timegrid-axis-cushion');
                if (allDayLabel && allDayLabel.textContent?.trim().toLowerCase() === 'all-day') {
                    allDayLabel.textContent = 'ALL DAY';
                    (allDayLabel as HTMLElement).style.fontWeight = '600';
                }

                const listLabels = document.querySelectorAll('.fc-list-event-time');
                listLabels.forEach((label) => {
                    if (label.textContent?.trim().toLowerCase() === 'all-day') {
                        label.textContent = 'All Day';
                    }
                });
            },
        });

        calendarEl._calendarInstance = calendar;
        calendar.render();

        return () => calendar.destroy();
    }, [calendarEvents]);

    const showAllModules = () => {
        setActiveModules(MODULES.map((module) => module.label));
        notifyFiltersCleared();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex flex-col gap-5 p-4 md:p-6">
                <section>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-3xl">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl dark:text-white">Calendar Overview</h1>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Monitor inventory schedules, transfers, off-campus returns, turnover activity, and approvals in one operational view.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={() => setSidebarOpen((open) => !open)} variant="outline" className="gap-2 xl:hidden">
                                {sidebarOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                                Filters
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={CalendarDays}
                        label="All Schedules"
                        value={metrics.total}
                        detail="Total calendar records from all modules."
                        tone="blue"
                    />
                    <SummaryCard
                        icon={CalendarCheck2}
                        label="Today"
                        value={metrics.today}
                        detail="Schedules with a date set for today."
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={CalendarClock}
                        label="Next 7 Days"
                        value={metrics.week}
                        detail="Upcoming schedules due within one week."
                        tone="amber"
                    />
                    <SummaryCard
                        icon={Filter}
                        label="Needs Action"
                        value={metrics.open}
                        detail="Schedules not yet completed, approved, returned, or cancelled."
                        tone="rose"
                    />
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Operations Calendar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {normalizedEvents.length} visible item{normalizedEvents.length === 1 ? '' : 's'} based on your filters.
                                </p>
                            </div>
                        </div>

                        <div
                            ref={calendarRef}
                            className="tap-track-calendar min-h-[680px] overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
                        />
                    </div>

                    <aside className={`${sidebarOpen ? 'grid' : 'hidden xl:grid'} content-start gap-4`}>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">Filters</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Find the schedule you need fast.</p>
                                </div>
                                <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setSidebarOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="relative mb-4">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search title, type, or status"
                                    className="h-10 rounded-lg border-slate-200 pl-9"
                                />
                            </div>

                            <div className="mb-3 flex gap-2">
                                <Button variant="outline" size="sm" onClick={showAllModules} className="h-8 flex-1">
                                    All
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setActiveModules([])} className="h-8 flex-1">
                                    None
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {MODULES.map(({ label, icon: Icon, color, tone }) => {
                                    const active = activeModules.includes(label);

                                    return (
                                        <button
                                            key={label}
                                            onClick={() =>
                                                setActiveModules((current) =>
                                                    current.includes(label) ? current.filter((module) => module !== label) : [...current, label],
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                                                active
                                                    ? tone
                                                    : 'border-slate-200 bg-white text-slate-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-400'
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/70">
                                                    <Icon className="h-4 w-4" style={{ color }} />
                                                </span>
                                                <span className="truncate text-sm font-medium">{label}</span>
                                            </span>
                                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {eventCounts[label] ?? 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4">
                                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Upcoming</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Next scheduled items from active filters.</p>
                            </div>

                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => {
                                        const module = moduleFor(event.type);
                                        const Icon = module.icon;

                                        return (
                                            <button
                                                key={event.id}
                                                onClick={() => event.url && window.open(event.url, '_blank')}
                                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span
                                                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                                                        style={{ backgroundColor: `${module.color}18` }}
                                                    >
                                                        <Icon className="h-4 w-4" style={{ color: module.color }} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                            {event.plainTitle}
                                                        </span>
                                                        <span className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span className="text-xs text-slate-500">{formatDate(event.start)}</span>
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(event.status)}`}
                                                            >
                                                                {event.status ? formatStatus(event.status) : 'No Status'}
                                                            </span>
                                                        </span>
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-950">
                                    <CalendarClock className="mx-auto h-8 w-8 text-slate-400" />
                                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">No upcoming items found</p>
                                    <p className="mt-1 text-xs text-slate-500">Try showing all modules or clearing your search.</p>
                                    <Button variant="outline" size="sm" onClick={showAllModules} className="mt-3">
                                        Reset filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </aside>
                </section>
            </div>
        </AppLayout>
    );
}

const summaryToneClasses = {
    blue: {
        icon: 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
        value: 'text-blue-700 dark:text-blue-300',
        accent: 'from-blue-500',
    },
    emerald: {
        icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
        value: 'text-emerald-700 dark:text-emerald-300',
        accent: 'from-emerald-500',
    },
    amber: {
        icon: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
        value: 'text-amber-700 dark:text-amber-300',
        accent: 'from-amber-500',
    },
    rose: {
        icon: 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60',
        value: 'text-rose-700 dark:text-rose-300',
        accent: 'from-rose-500',
    },
};

function SummaryCard({
    icon: Icon,
    label,
    value,
    detail,
    tone,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    detail: string;
    tone: keyof typeof summaryToneClasses;
}) {
    const classes = summaryToneClasses[tone];

    return (
        <div className="relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${classes.accent} to-transparent`} />

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <p className="max-w-[12rem] text-sm leading-5 font-medium text-muted-foreground">{label}</p>
                    <p className={`text-3xl font-semibold tracking-tight ${classes.value}`}>{value.toLocaleString()}</p>
                </div>

                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${classes.icon}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
            </div>

            <p className="mt-5 border-t pt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
    );
}
