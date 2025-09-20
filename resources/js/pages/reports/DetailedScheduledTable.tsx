import { useEffect, useState } from 'react';

interface ScheduleRow {
    id: number;
    department: string;
    building: string;
    room: string;
    sub_area: string | null;
    inventory_month: string;
    actual_date: string | null;
    assets: number;
    status: string;
}

interface DetailedScheduledTableProps {
    schedules: ScheduleRow[]; // ✅ plain array only
}

export default function DetailedScheduledTable({ schedules }: DetailedScheduledTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    // ✅ Always have at least 1 page
    const totalPages = Math.max(1, Math.ceil(schedules.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = schedules.slice(startIndex, startIndex + rowsPerPage);

    const STATUS_LABELS: Record<string, string> = {
        Completed: 'Completed',
        Pending: 'Pending',
        Pending_Review: 'Pending Review', // 👈 fix underscore
        Overdue: 'Overdue',
        Cancelled: 'Cancelled',
    };

    // ✅ Clamp currentPage when schedules shrink (e.g., filters applied)
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
        if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [schedules, totalPages, currentPage]);

    if (!schedules || schedules.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                <p className="text-lg font-semibold">No Data Available</p>
                <p className="text-sm">Try adjusting your filters to see results.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-800">
                            <th className="px-4 py-3 font-semibold">#</th>
                            <th className="px-4 py-3 font-semibold">Unit / Dept</th>
                            <th className="px-4 py-3 font-semibold">Building</th>
                            <th className="px-4 py-3 font-semibold">Room</th>
                            <th className="px-4 py-3 font-semibold">Sub-Area</th>
                            <th className="px-4 py-3 font-semibold">Inventory Month</th>
                            <th className="px-4 py-3 font-semibold">Actual Date</th>
                            <th className="px-4 py-3 text-right font-semibold">Assets</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, idx) => (
                            <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t transition hover:bg-gray-100`}>
                                <td className="px-4 py-3">{startIndex + idx + 1}</td>
                                <td className="px-4 py-3">{row.department && row.department.trim() !== '' ? row.department : '—'}</td>
                                <td className="px-4 py-3">{row.building ?? '—'}</td>
                                <td className="px-4 py-3">{row.room ?? '—'}</td>
                                <td className="px-4 py-3">{row.sub_area ?? '—'}</td>
                                <td className="px-4 py-3">{row.inventory_month ?? '—'}</td>
                                <td className="px-4 py-3">
                                    {row.actual_date
                                        ? new Date(row.actual_date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: '2-digit',
                                          })
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">{row.assets ?? 0}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            row.status === 'Completed'
                                                ? 'bg-green-100 text-green-700'
                                                : row.status === 'Pending'
                                                  ? 'bg-blue-100 text-blue-700'
                                                  : row.status === 'Pending_Review'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : row.status === 'Overdue'
                                                      ? 'bg-[#800000]/10 text-[#800000]' // maroon
                                                      : row.status === 'Cancelled'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {STATUS_LABELS[row.status] ?? row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            currentPage === 1 ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            currentPage === totalPages ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
