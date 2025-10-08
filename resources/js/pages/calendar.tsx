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
import '../../css/calendar-overrides.css';

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

    // useEffect(() => {
    //     if (!calendarRef.current) return;

    //     const filtered = events.filter(e => activeModules.includes(e.type));

    //     const calendar = new FullCalendar(calendarRef.current, {
    //         plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    //         headerToolbar: {
    //             left: 'prev,next today',
    //             center: 'title',
    //             right: 'dayGridMonth,timeGridWeek,listWeek',
    //         },
    //         buttonText: {
    //             today: 'Today',
    //             month: 'Month',
    //             week: 'Week',
    //             list: 'List',
    //         },
    //         initialView: 'dayGridMonth',
    //         navLinks: true,
    //         events: filtered,

    //         datesSet: () => {
    //             const allDayLabel = document.querySelector('.fc-timegrid-axis-cushion');
    //             if (allDayLabel && allDayLabel.textContent?.trim().toLowerCase() === 'all-day') {
    //                 allDayLabel.textContent = 'ALL DAY';
    //                 (allDayLabel as HTMLElement).style.fontWeight = '600';
    //             }

    //             const listLabels = document.querySelectorAll('.fc-list-event-time');
    //             listLabels.forEach((label) => {
    //                 if (label.textContent?.trim().toLowerCase() === 'all-day') {
    //                     label.textContent = 'ALL DAY';
    //                     // (label as HTMLElement).style.fontWeight = '600'; // make bold
    //                 }
    //             });
    //         },


    //         eventClick: (info: EventClickArg) => {
    //             info.jsEvent.preventDefault();
    //             if (info.event.url) window.open(info.event.url, '_blank');
    //         },
    //         height: 'auto',
    //         eventDisplay: 'block',
    //         eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },
    //         dayMaxEventRows: 5,
    //         moreLinkText: 'more',

    //         slotMinTime: '-01:00:00',     // start at midnight
    //         slotMaxTime: '26:01:00',     // include midnight at the bottom
    //         scrollTime: '06:00:00',      // default scroll position (6 AM)
    //         scrollTimeReset: false,
    //         expandRows: true,
    //         slotLabelInterval: '1:00',   // 1-hour spacing between rows
    //         slotLabelFormat: {           // proper time labels
    //             hour: 'numeric',
    //             minute: '2-digit',
    //             meridiem: 'short',
    //             hour12: true,
    //         },
    //         views: {
    //             dayGridMonth: { displayEventTime: false }, // hide time in month
    //             timeGridWeek: { displayEventTime: false }, // hide time in week
    //             timeGridDay: { displayEventTime: false },   // hide time in day view
    //         },
    //         eventDidMount: (info) => {
    //             const titleEl = info.el.querySelector('.fc-event-title');
    //             if (titleEl) titleEl.innerHTML = info.event.title;
    //         },
    //         eventContent: function(arg) {
    //             return { html: arg.event.title };
    //         },
    //     });

    //     calendar.render();
    //     return () => calendar.destroy();
    // }, [events, activeModules]);

    useEffect(() => {
        if (!calendarRef.current) return;

        // Extend HTMLDivElement to hold a reference to the calendar
        type CalendarElement = HTMLDivElement & { _calendarInstance?: FullCalendar };
        const calendarEl = calendarRef.current as CalendarElement;

        // Remember current view and date if an instance already exists
        const existingCalendar = calendarEl._calendarInstance;
        const currentView = existingCalendar?.view?.type || 'dayGridMonth';
        const currentDate = existingCalendar?.getDate?.() || new Date();

        // Destroy old instance before creating a new one
        if (existingCalendar) {
            existingCalendar.destroy();
        }

        const filtered = events.filter(e => activeModules.includes(e.type));

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
                list: 'List',
            },
            initialView: currentView, // ✅ Preserve view
            initialDate: currentDate, // ✅ Preserve date
            navLinks: true,
            events: filtered,
            height: 'auto',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },
            dayMaxEventRows: 5,
            moreLinkText: 'more',

            slotMinTime: '-01:00:00',
            slotMaxTime: '26:01:00',
            scrollTime: '06:00:00',
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

            eventDidMount: (info) => {
                const titleEl = info.el.querySelector('.fc-event-title');
                if (titleEl) titleEl.innerHTML = info.event.title;
            },
            eventContent: (arg) => ({ html: arg.event.title }),
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
                        label.textContent = 'ALL DAY';
                        (label as HTMLElement).style.fontWeight = '600';
                    }
                });
            },
        });

        // Save the new instance reference for reuse
        calendarEl._calendarInstance = calendar;

        calendar.render();

        return () => calendar.destroy();
    }, [events, activeModules]);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="p-6 space-y-4">
                {/* Shared Header */}
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Calendar Overview
                </h1>

                {/* Main container with equal-height calendar + sidebar */}
                <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] max-h-[80vh]">
                    {/* Calendar Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div
                            ref={calendarRef}
                            className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 rounded-xl shadow p-4 border border-gray-200 dark:border-neutral-700"
                            style={{
                                maxHeight: 'calc(100vh - 10rem)', // adjust based on header height
                            }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div
                        className={`fixed lg:relative top-0 right-0 h-full lg:h-auto lg:w-80 w-64 z-50 bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 shadow-lg transition-transform duration-300 ${
                            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                        } flex flex-col self-stretch`}
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

                        {/* Filter List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {MODULES.map(({ label, icon: Icon }) => {
                                const active = activeModules.includes(label);

                                const colorMap: Record<string, string> = {
                                    'Inventory Scheduling': '#3d5ea5ff',
                                    'Property Transfer': '#16a34a',
                                    'Off-Campus Issued': '#f59e0b',
                                    'Off-Campus Return': '#eab308',
                                    'Turnover/Disposal': '#9333ea',
                                    'Form Approval': '#dc2626',
                                };

                                const bgColor = colorMap[label];
                                const textColor = active ? 'text-white' : 'text-gray-800 dark:text-gray-200';
                                const hoverColor = active ? '' : 'hover:opacity-90';

                                return (
                                <button
                                    key={label}
                                    onClick={() =>
                                        setActiveModules(prev =>
                                            prev.includes(label)
                                            ? prev.filter(m => m !== label)
                                            : [...prev, label]
                                        )
                                    }
                                    className={`
                                        flex items-center gap-2 w-full rounded-md px-3 py-2 font-medium transition-all duration-200
                                        border border-transparent cursor-pointer ${textColor} ${hoverColor}
                                        ${active
                                            ? ''
                                            : 'border-gray-600 dark:border-neutral-700 bg-transparent'}
                                    `}
                                    style={{
                                        backgroundColor: active ? bgColor : 'transparent',
                                    }}
                                >
                                    <Icon
                                        className="h-4 w-4 shrink-0"
                                        style={{ color: active ? 'white' : bgColor }}
                                    />
                                    <span>{label}</span>
                                </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="border-t border-gray-200 dark:border-neutral-800 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Legend
                            </h3>
                            <div className="space-y-2 text-sm">
                                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded"></span> Inventory Scheduling</span>
                                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-600 rounded"></span> Property Transfer</span>
                                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Off-Campus</span>
                                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-600 rounded"></span> Turnover / Disposal</span>
                                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded"></span> Form Approval</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Toggle (mobile only) */}
                    <Button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        variant="outline"
                        size="icon"
                        className="fixed bottom-6 right-6 lg:hidden z-50 bg-white dark:bg-neutral-800 shadow-lg border"
                    >
                        <Filter className="h-5 w-5 text-blue-600" />
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
