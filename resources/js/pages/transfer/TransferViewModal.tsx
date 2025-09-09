import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import { Transfer, InventoryList, AssetModel, formatLabel } from '@/types/custom-index';
import { useMemo } from 'react';

interface TransferViewModalProps {
    open: boolean;
    onClose: () => void;
    transfer: Transfer;
    assets: InventoryListWithSnake[];
}

export type InventoryListWithSnake = InventoryList & {
    asset_model?: AssetModel;
};

export default function TransferViewModal({
    open,
    onClose,
    transfer,
    assets,
}: TransferViewModalProps) {

    const recordNo = String(transfer.id).padStart(2, '0');

    const formatDateLong = (d?: string | null) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime())
        ? d
        : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const StatusPill = ({ status }: { status?: string | null }) => {
        const s = (status ?? '').toLowerCase().replace(/_/g, ' ');
        const formattedStatus = s
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

        const cls =
        s === 'completed'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : s === 'in progress'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : s === 'overdue'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

        return (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                {status ? formattedStatus : '—'}
            </span>
        );
    };

    // Per-asset transfer status pill (pending/completed/cancelled)
    const AssetStatusPill = ({ status }: { status?: string | null }) => {
        const s = (status ?? 'pending').toLowerCase();
        const label = s.charAt(0).toUpperCase() + s.slice(1);
        const cls =
        s === 'transferred'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : s === 'cancelled'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300'; // pending

        return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
    };

    // Map asset_id -> pivot (so we can show per-asset status/moved_at)
    const pivotByAssetId = useMemo(() => {
        const map: Record<number, { asset_transfer_status?: string | null; moved_at?: string | null }> = {};
        (transfer.transferAssets ?? []).forEach((ta) => {
            map[Number(ta.asset_id)] = {
                asset_transfer_status: ta.asset_transfer_status ?? 'pending',
                moved_at: ta.moved_at ?? null,
            };
            });
        return map;
    }, [transfer.transferAssets]);

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden"
        >
            {/* Header */}
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-">
                    <img
                        src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                        alt="Logo"
                        className="h-25 opacity-90"
                    />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">
                        Property Management Office
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>
                <div className="text-right text-sm leading-snug">
                    <p>
                        <span className="text-gray-600 dark:text-gray-400">Transfer Record #:</span>{' '}
                        <span className="font-semibold">{recordNo}</span>
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <StatusPill status={transfer.status} />
                    </p>
                </div>
            </div>

            {/* Locations */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                <section>
                    <h3 className="mb-2 text-base font-semibold">Current Location</h3>
                    <p className="text-sm">
                        <span className="font-semibold">Building:</span>{' '}
                        {transfer.currentBuildingRoom?.building?.name ?? '—'} (
                        {transfer.currentBuildingRoom?.building?.code ?? '—'})
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Room:</span>{' '}
                        {transfer.currentBuildingRoom?.room ?? '—'}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Unit/Dept/Lab:</span>{' '}
                        {transfer.currentOrganization?.code ?? '—'}
                    </p>
                </section>
                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Receiving Location</h3>
                    <p className="text-sm">
                        <span className="font-semibold">Building:</span>{' '}
                        {transfer.receivingBuildingRoom?.building?.name ?? '—'} (
                        {transfer.receivingBuildingRoom?.building?.code ?? '—'})
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Room:</span>{' '}
                        {transfer.receivingBuildingRoom?.room ?? '—'}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Unit/Dept/Lab:</span>{' '}
                        {transfer.receivingOrganization?.code ?? '—'}
                    </p>
                </section>
            </div>

            {/* Assets */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                        {/* <th className="px-3 py-2 text-center font-medium">Brand</th> */}
                        <th className="px-3 py-2 text-center font-medium">Category</th>
                        <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                        <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                        <th className="px-3 py-2 text-center font-medium">Transfer Status</th>
                        <th className="px-3 py-2 text-center font-medium">Date Transferred</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => {
                        const pivot = pivotByAssetId[Number(asset.id)] ?? {};
                        const perAssetStatus = (pivot.asset_transfer_status as string) ?? 'pending';
                        const movedAt = pivot.moved_at ? formatDateLong(pivot.moved_at) : '—';

                        return (
                            <tr key={asset.id} className="border-t">
                            {/* <td className="px-3 py-2">{asset.asset_model?.brand ?? '—'}</td> */}
                            <td className="px-3 py-2">{asset.asset_model?.category?.name ?? '—'}</td>
                            <td className="px-3 py-2">{(asset.serial_no ?? '—').toUpperCase()}</td>
                            <td className="px-3 py-2">{formatLabel(asset.asset_name ?? '—')}</td>
                            <td className="px-3 py-2">
                                <AssetStatusPill status={perAssetStatus} />
                            </td>
                                <td className="px-3 py-2">{movedAt}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Dates */}
            <div className="print-footer mt-2 flex justify-between text-sm font-medium print:w-[170mm]">
                <p>
                    <span className="font-semibold">Date of Transfer:</span>{' '}
                    {formatDateLong(transfer.scheduled_date)}
                </p>
                {transfer.actual_transfer_date && (
                    <p className="text-right">
                        <span className="font-semibold">Actual Date:</span>{' '}
                        {formatDateLong(transfer.actual_transfer_date)}
                    </p>
                )}
            </div>

            {/* Remarks */}
            <div className="flex justify-between items-start mb-1 mt-1">
                <h4 className="text-sm font-semibold text-gray-800">Remarks:</h4>
                <p className="text-sm font-medium text-gray-800">
                    <strong>Total Assets:</strong> {assets.length}
                </p>
            </div>

            {transfer.remarks && (
                <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">
                    {transfer.remarks?.trim() || '—'}
                </p>
            )}

            <div className="h-2" />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 mt-5 text-sm">
                {transfer.assignedBy?.name && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Prepared By:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-700">{transfer.assignedBy.name}</p>
                        <p className="text-xs text-gray-500 italic">[Role Here]</p>
                    </div>
                )}

                {transfer.designatedEmployee?.name && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Designated To:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-800">{transfer.designatedEmployee.name}</p>
                        <p className="text-xs text-gray-500 italic">[Role Here]</p>
                    </div>
                )}

                {transfer.received_by && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Received By:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-800">{transfer.received_by}</p>
                        <p className="text-xs text-gray-500 italic">[Role Here]</p>
                    </div>
                )}

                {/* Approved By */}
                <div className="text-center">
                    <p className="font-semibold mb-8">Approved By:</p>
                    <div className="border-t border-black w-48 mx-auto mb-1"></div>
                    <p className="font-bold text-gray-800">{transfer.approved_by_name ?? '—'}</p>
                    <p className="text-xs text-gray-500 italic">[Role Here]</p>
                </div>
            </div>

            {/* Actions */}
            <div className="text-center print:hidden mt-1">
                <a
                    onClick={onClose}
                    className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"
                >
                    ← Back to Transfers
                </a>

                {(transfer.status).toLowerCase() !== 'pending_review' && (
                    <Button
                        onClick={() => window.print()}
                        className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                    >
                        🖨️ Print Form
                    </Button>
                )}
            </div>
        </ViewModal>
    );
}
