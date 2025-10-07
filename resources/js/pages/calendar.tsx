import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useRef, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import '@fullcalendar/daygrid';
import '@fullcalendar/timegrid';
import '@fullcalendar/list';
import type { EventClickArg } from '@fullcalendar/core';
import {
    Calendar,
    Truck,
    ClipboardList,
    FileText,
    Archive,
    Filter,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
    events: {
        id: string;
        title: string;
        start: string;
        end?: string;
        color: string;
        url?: string;
        type: string;
        status: string;
    }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
];

const MODULES = [
    { label: 'Inventory Scheduling', icon: Calendar },
    { label: 'Property Transfer', icon: Truck },
    { label: 'Off-Campus Issued', icon: ClipboardList },
    { label: 'Off-Campus Return', icon: ClipboardList },
    { label: 'Turnover/Disposal', icon: Archive },
    { label: 'Form Approval', icon: FileText },
];

export default function CalendarPage({ events }: CalendarProps) {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [activeModules, setActiveModules] = useState<string[]>(MODULES.map(m => m.label));
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!calendarRef.current) return;

        const filtered = events.filter(e => activeModules.includes(e.type));

        const calendar = new FullCalendar(calendarRef.current, {
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
                list: 'List',
            },
            initialView: 'dayGridMonth',
            navLinks: true,
            events: filtered,
            eventClick: (info: EventClickArg) => {
                info.jsEvent.preventDefault();
                if (info.event.url) window.open(info.event.url, '_blank');
            },
            height: 'auto',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },
            dayMaxEventRows: 3,
            moreLinkText: 'more',
            views: {
                dayGridMonth: { displayEventTime: false },
            },
            eventDidMount: (info) => {
                const titleEl = info.el.querySelector('.fc-event-title');
                if (titleEl) titleEl.innerHTML = info.event.title;
            },
        });

        calendar.render();
        return () => calendar.destroy();
    }, [events, activeModules]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Main Calendar Section */}
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Calendar Overview
                    </h1>

                    <div
                        ref={calendarRef}
                        className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4 border border-gray-200 dark:border-neutral-700"
                    />
                </div>

                {/* Sidebar Panel */}
                <div
                    className={`fixed lg:static top-0 right-0 h-full lg:h-auto lg:w-72 w-64 z-50 bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 shadow-lg transition-transform duration-300 ${
                        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Module Filters */}
                    <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[calc(100vh-150px)]">
                        {MODULES.map(({ label, icon: Icon }) => {
                            const active = activeModules.includes(label);
                            return (
                                <Button
                                    key={label}
                                    variant={active ? 'default' : 'outline'}
                                    onClick={() =>
                                        setActiveModules(prev =>
                                            prev.includes(label)
                                                ? prev.filter(m => m !== label)
                                                : [...prev, label]
                                        )
                                    }
                                    className={`flex items-center justify-start gap-2 w-full cursor-pointer transition-all ${
                                        active
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                            : 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="border-t border-gray-200 dark:border-neutral-800 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</h3>
                        <div className="space-y-2 text-sm">
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded"></span> Inventory Scheduling</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-600 rounded"></span> Property Transfer</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Off-Campus</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-600 rounded"></span> Turnover / Disposal</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded"></span> Form Approval</span>
                        </div>
                    </div>
                </div>

                {/* Floating Toggle for Mobile */}
                <Button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    variant="outline"
                    size="icon"
                    className="fixed bottom-6 right-6 lg:hidden z-50 bg-white dark:bg-neutral-800 shadow-lg border"
                >
                    <Filter className="h-5 w-5 text-blue-600" />
                </Button>
            </div>
        </AppLayout>
    );
}
