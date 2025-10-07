import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useRef } from 'react';
import type { BreadcrumbItem } from '@/types';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
// import '@fullcalendar/core/index.css';
import '@fullcalendar/daygrid';
import '@fullcalendar/timegrid';
import '@fullcalendar/list';

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

export default function CalendarPage({ events }: CalendarProps) {
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!calendarRef.current) return;

        const calendar = new FullCalendar(calendarRef.current, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek',
            },
            initialView: 'dayGridMonth',
            navLinks: true,
            events,
            eventClick: (info) => {
                info.jsEvent.preventDefault();
                if (info.event.url) {
                    window.open(info.event.url, '_blank');
                }
            },
            height: 'auto',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },
            dayMaxEventRows: true,
        });

        calendar.render();
        return () => calendar.destroy();
    }, [events]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex flex-col p-6 space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Calendar Overview</h1>
                <div ref={calendarRef} className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4 border border-gray-200 dark:border-neutral-700" />
            </div>
        </AppLayout>
    );
}
