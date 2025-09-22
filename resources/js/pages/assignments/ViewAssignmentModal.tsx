import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PageInfo } from '@/components/Pagination';
import Pagination from '@/components/Pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';

import type { AssetAssignment, AssetAssignmentItem, Paginated } from '@/types/asset-assignment';

import { ViewAssetModal } from './ViewAssetModal';

const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

type Props = {
    open: boolean;
    onClose: () => void;
    assignment: AssetAssignment;
    items: Paginated<AssetAssignmentItem>;
};

export default function ViewAssignmentModal({ 
    open, 
    onClose, 
    assignment, 
    items,
}: Props) {

    const [viewAssetId, setViewAssetId] = useState<number | null>(null);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="w-[min(1000px,95vw)] max-w-none max-h-[90vh] min-h-[60vh] overflow-y-auto p-0 sm:max-w-[1100px]">
                <DialogTitle className="sr-only">View Assignment {assignment.id}</DialogTitle>
                <div className="print-force-light bg-white p-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
                    {/* Header */}
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center">
                            <img
                                src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                                alt="Logo"
                                className="h-24 opacity-90"
                            />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 text-center">
                            <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">
                                Property Management Office
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                                pmo@auf.edu.ph
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                                +63 973 234 3456
                            </p>
                        </div>
                        <div className="text-right text-sm leading-snug">
                            <p>
                                <span className="text-gray-600 dark:text-gray-400">Assignment ID:</span>{' '}
                                <span className="font-semibold">#{assignment.id}</span>
                            </p>
                            <p className="mt-1">
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>{' '}
                                {formatDateLong(assignment.date_assigned)}
                            </p>
                        </div>
                    </div>

                    {/* Info Sections */}
                    <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12">
                        {/* Personnel Info */}
                        <section>
                            <h3 className="mb-2 text-base font-semibold">Personnel Information</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="w-1/3 bg-gray-100 px-3 py-2 font-medium">Name</td>
                                            <td className="px-3 py-2 text-right">{assignment.personnel?.full_name ?? '—'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 font-medium">Position</td>
                                            <td className="px-3 py-2 text-right">{assignment.personnel?.position ?? '—'}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-gray-100 px-3 py-2 font-medium">Unit/Department</td>
                                            <td className="px-3 py-2 text-right">
                                                {assignment.personnel?.unit_or_department?.name ?? '—'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Assignment Details */}
                        <section>
                            <h3 className="mb-2 text-base font-semibold">Assignment Details</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 font-medium">Assigned By</td>
                                            <td className="px-3 py-2 text-right">{assignment.assigned_by_user?.name ?? '—'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 font-medium">Remarks</td>
                                            <td className="px-3 py-2 text-right">{assignment.remarks ?? '—'}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-gray-100 px-3 py-2 font-medium">Total Assets</td>
                                            <td className="px-3 py-2 text-right">{items.total}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Assets Table */}
                    <div className="mt-8 mb-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="bg-blue-200 px-4 py-2 text-sm font-semibold text-gray-800 dark:bg-neutral-900 dark:text-gray-200">
                            Assigned Assets
                        </div>

                        <table className="w-full text-sm border-collapse text-center">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="border px-2 py-1">#</th>
                                    <th className="border px-2 py-1">Serial No</th>
                                    <th className="border px-2 py-1">Asset Name</th>
                                    <th className="border px-2 py-1">Brand / Model</th>
                                    <th className="border px-2 py-1">Category</th>
                                    <th className="border px-2 py-1">Unit/Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.length > 0 ? (items.data.map((i, idx) => (
                                    <tr key={i.id}>
                                        <td className="border px-2 py-1">{(items.current_page - 1) * items.per_page + idx + 1}</td>
                                        <td className="border px-2 py-1">
                                            <button
                                                onClick={() => setViewAssetId(i.asset?.id ?? null)}
                                                className="text-blue-600 underline cursor-pointer"
                                            >
                                                {i.asset?.serial_no ?? '—'}
                                            </button>
                                        </td>
                                        <td className="border px-2 py-1">{i.asset?.asset_name ?? '—'}</td>
                                        <td className="border px-2 py-1">
                                            {i.asset?.asset_model
                                            ? `${i.asset.asset_model.brand} ${i.asset.asset_model.model}`
                                            : '—'}
                                        </td>
                                        <td className="border px-2 py-1">{i.asset?.asset_model?.category?.name ?? '—'}</td>
                                        <td className="border px-2 py-1">{i.asset?.unit_or_department?.name ?? '—'}</td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="border px-2 py-4 text-muted-foreground">
                                        No assets assigned.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between p-3">
                            <PageInfo page={items.current_page} total={items.total} pageSize={items.per_page} label="assets" />
                            <Pagination
                                page={items.current_page}
                                total={items.total}
                                pageSize={items.per_page}
                                onPageChange={(p) => {
                                    router.get(`/assignments/${assignment.id}`, { page: p }, { preserveScroll: true });
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="text-center print:hidden">
                        <DialogClose asChild>
                            <Button variant="primary" className="mr-2 cursor-pointer">
                                ← Back to Assignments
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={() => window.print()}
                            className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                        >
                            🖨️ Print Form
                        </Button>
                    </div>
                </div>
                {viewAssetId && (
                    <ViewAssetModal
                        assetId={viewAssetId}
                        onClose={() => setViewAssetId(null)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
