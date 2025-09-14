import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatEnums, ucwords } from '@/types/custom-index';
import axios from 'axios';

type AssetWithStatus = {
    id: number;
    asset_name: string;
    serial_no: string;
    inventory_status: string;
    unit_or_department_id?: number | null;
    unit_or_department_name?: string | null;
    building_id?: number | null;
    building_name?: string | null;
    room_id?: number | null;
    room_name?: string | null;
    sub_area_id?: number | null;
    sub_area_name?: string | null;
    asset_model?: {
        category?: { name?: string };
    };
};

type RowAssetsModalProps = {
    open: boolean;
    onClose: () => void;
    scheduleId: number;
    rowId: number;
    type: 'building_room' | 'sub_area';
    title: string;
    unitId?: number | null;
};

function ViewRowAssetModal({ 
    open, 
    onClose, 
    scheduleId, 
    rowId, 
    type, 
    title,
    unitId,
}: RowAssetsModalProps) {
    const [assets, setAssets] = useState<AssetWithStatus[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const fetchAssets = useCallback(
        async (p: number) => {
            const res = await axios.get(
                route('schedules.rowAssets', { schedule: scheduleId, row: rowId }),
                { params: { page: p, per_page: pageSize, type, unit_id: unitId } }
            );
            setAssets(res.data.data);
            setTotal(res.data.total);
        },
    [scheduleId, rowId, type, pageSize, unitId]
    );


    useEffect(() => {
        if (open) fetchAssets(page);
    }, [open, page, fetchAssets]);


    const StatusPill = ({ status }: { status?: string | null }) => {
        const cls =
        status === 'inventoried'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : status === 'scheduled'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : status === 'not_inventoried'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

        return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
            {status ? formatEnums(status) : '—'}
        </span>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="w-[min(900px,95vw)] max-w-none overflow-hidden p-0 sm:max-w-[1100px]">
                <div className="print-force-light bg-white p-6 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-wide">{title}</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        {assets.length > 0 ? (
                        <>
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="border px-3 py-2 text-center">#</th>
                                        <th className="border px-3 py-2 text-center">Asset Name</th>
                                        <th className="border px-3 py-2 text-center">Serial No</th>
                                        <th className="border px-3 py-2 text-center">Category</th>
                                        <th className="border px-3 py-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((a, idx) => (
                                        <tr
                                            key={a.id}
                                            className="odd:bg-white even:bg-gray-50 dark:odd:bg-neutral-950 dark:even:bg-neutral-900"
                                        >
                                            <td className="border px-3 py-2 text-center">
                                                {(page - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="border px-3 py-2 text-center">{ucwords(a.asset_name ?? '—')}</td>
                                            <td className="border px-3 py-2 text-center">{a.serial_no ?? '—'}</td>
                                            <td className="border px-3 py-2 text-center">
                                                {ucwords(a.asset_model?.category?.name ?? '—')}
                                            </td>
                                            <td className="border px-3 py-2 text-center">
                                                <StatusPill status={a.inventory_status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between p-3">
                                <PageInfo page={page} total={total} pageSize={pageSize} label="assets" />
                                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
                            </div>
                        </>
                        ) : (
                            <p className="p-4 text-sm text-center text-muted-foreground">
                                No assets for this scope.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewRowAssetModal;
