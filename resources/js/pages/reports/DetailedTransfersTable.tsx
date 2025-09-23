import { useState } from 'react';

export const STATUS_LABELS: Record<string, string> = {
    completed: 'Completed',
    pending_review: 'Pending Review',
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

type Transfer = {
    id: number;
    current_building: string | null;
    current_room: string | null;
    current_department: string | null;
    receiving_building: string | null;
    receiving_room: string | null;
    receiving_department: string | null;
    assigned_by: string | null;
    status: string;
    assets: number;
    created_at: string;
    scheduled_date?: string | null;
};

type Props = { transfers: Transfer[] };

export default function DetailedTransfersTable({ transfers }: Props) {
    const [page, setPage] = useState(1);
    const rowsPerPage = 8;
    const totalPages = Math.max(1, Math.ceil(transfers.length / rowsPerPage));
    const startIndex = (page - 1) * rowsPerPage;
    const currentRows = transfers.slice(startIndex, startIndex + rowsPerPage);

    if (transfers.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                <p className="text-lg font-semibold">No Data Available</p>
                <p className="text-sm">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-800">
                            <th className="px-4 py-3 font-semibold">#</th>
                            <th className="px-4 py-3 font-semibold">Current Building</th>
                            <th className="px-4 py-3 font-semibold">Current Unit/Department</th>
                            <th className="px-4 py-3 font-semibold">Receiving Building</th>
                            <th className="px-4 py-3 font-semibold">Receiving Unit/Department</th>
                            <th className="px-4 py-3 font-semibold">Assigned By</th>
                            <th className="px-4 py-3 font-semibold">Assets</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Scheduled Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((t, idx) => (
                            <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t`}>
                                <td className="px-4 py-3">{startIndex + idx + 1}</td>
                                <td className="px-4 py-3">
                                    {t.current_building ? `${t.current_building}${t.current_room ? ` (${t.current_room})` : ''}` : '—'}
                                </td>
                                <td className="px-4 py-3">{t.current_department ?? '—'}</td>
                                <td className="px-4 py-3">
                                    {t.receiving_building ? `${t.receiving_building}${t.receiving_room ? ` (${t.receiving_room})` : ''}` : '—'}
                                </td>
                                <td className="px-4 py-3">{t.receiving_department ?? '—'}</td>
                                <td className="px-4 py-3">{t.assigned_by ?? '—'}</td>
                                <td className="px-4 py-3">{t.assets ?? 0}</td>

                                {/* ✅ Use STATUS_LABELS mapping */}
                                <td className="px-4 py-3">{STATUS_LABELS[t.status] ?? t.status}</td>

                                <td className="px-4 py-3">
                                    {t.scheduled_date
                                        ? new Date(t.scheduled_date).toLocaleDateString('en-US', {
                                              month: 'long',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-600">
                    Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className={`rounded-md px-4 py-2 ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`rounded-md px-4 py-2 ${
                            page === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
