import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type AuditLog = {
    id: number;
    actor_name: string | null;
    unit_or_department?: { name: string };
    action: string;
    subject_type: string;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    ip_address?: string | null;
    route?: string | null;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type AuditLogFilters = {
    from?: string;
    to?: string;
    actor_id?: string;
    action?: string;
    subject_type?: string;
};

type PaginatedLogs = {
    data: AuditLog[];
    links: PaginationLink[];
};

type PageProps = {
    title: string;
    filters: AuditLogFilters;
    logs: PaginatedLogs;
};

export default function AuditTrailIndex() {
    const { title, logs, filters } = usePage<PageProps>().props;
    const [form, setForm] = useState<AuditLogFilters>(filters);
    const [expanded, setExpanded] = useState<number | null>(null);

    function applyFilters() {
        router.get('/audit-log', form, { preserveState: true });
    }

    const breadcrumbs: BreadcrumbItem[] = [{ title, href: '/audit-log' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">{title}</h1>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="date"
                        value={form.from || ''}
                        onChange={(e) => setForm({ ...form, from: e.target.value })}
                        className="rounded border p-2"
                    />
                    <input
                        type="date"
                        value={form.to || ''}
                        onChange={(e) => setForm({ ...form, to: e.target.value })}
                        className="rounded border p-2"
                    />
                    <input
                        type="text"
                        placeholder="Actor ID"
                        value={form.actor_id || ''}
                        onChange={(e) => setForm({ ...form, actor_id: e.target.value })}
                        className="rounded border p-2"
                    />
                    <select value={form.action || ''} onChange={(e) => setForm({ ...form, action: e.target.value })} className="rounded border p-2">
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login_success">Login Success</option>
                        <option value="login_failed">Login Failed</option>
                        <option value="logout">Logout</option>
                        <option value="role_changed">Role Changed</option>
                        <option value="form_approved">Form Approved</option>
                        <option value="form_rejected">Form Rejected</option>
                    </select>
                    <button onClick={applyFilters} className="rounded bg-blue-600 px-4 py-2 text-white">
                        Apply
                    </button>
                </div>

                {/* Logs Table */}
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Actor</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Action</th>
                            <th className="border p-2">Subject</th>
                            <th className="border p-2">IP</th>
                            <th className="border p-2">Route</th>
                            <th className="border p-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.data.map((log) => (
                            <tr key={log.id}>
                                <td className="border p-2">{log.created_at}</td>
                                <td className="border p-2">{log.actor_name || '-'}</td>
                                <td className="border p-2">{log.unit_or_department?.name || '-'}</td>
                                <td className="border p-2">{log.action}</td>
                                <td className="border p-2">{log.subject_type}</td>
                                <td className="border p-2">{log.ip_address || '-'}</td>
                                <td className="border p-2">{log.route || '-'}</td>
                                <td className="border p-2">
                                    <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} className="text-blue-600 underline">
                                        {expanded === log.id ? 'Hide' : 'View'}
                                    </button>
                                    {expanded === log.id && (
                                        <div className="mt-2 space-y-2 text-sm text-gray-700">
                                            <div>
                                                <strong>Old Values:</strong>
                                                <pre className="overflow-x-auto rounded bg-gray-100 p-2">
                                                    {JSON.stringify(log.old_values, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <strong>New Values:</strong>
                                                <pre className="overflow-x-auto rounded bg-gray-100 p-2">
                                                    {JSON.stringify(log.new_values, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
