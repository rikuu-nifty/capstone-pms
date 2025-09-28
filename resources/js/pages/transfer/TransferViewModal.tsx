import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import { Transfer, InventoryList, AssetModel, formatLabel, formatEnums } from '@/types/custom-index';
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
        const map: Record<
            number,
            {
                asset_transfer_status?: string | null;
                moved_at?: string | null;
                from_sub_area?: string | null;
                to_sub_area?: string | null;
                remarks?: string | null; 
            }
        > = {};

        (transfer.transferAssets ?? []).forEach((ta) => {
            map[Number(ta.asset_id)] = {
                asset_transfer_status: ta.asset_transfer_status ?? 'pending',
                moved_at: ta.moved_at ?? null,
                from_sub_area: ta.fromSubArea?.name ?? null,
                to_sub_area: ta.toSubArea?.name ?? null,
                remarks: ta.remarks ?? null,
            };
        });

        return map;
    }, [transfer.transferAssets]);

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible"
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
                {/* Current Location */}
                <section className="md:w-[400px]">
                    <h3 className="mb-2 text-base font-semibold">TRANSFER FROM</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Unit/Dept/Lab
                                    </td>
                                    <td className="px-3 py-2 font-medium text-right">
                                        {formatEnums(transfer.currentOrganization?.code ?? '—')}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Building (Room)
                                    </td>
                                    <td className="px-3 py-2 font-medium text-right">
                                        {formatEnums(transfer.receivingBuildingRoom?.building?.code ?? '—')} ({transfer.currentBuildingRoom?.room ?? '—'})
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Scheduled Date
                                    </td>
                                    <td className="px-3 py-2 font-medium text-right">
                                        {formatDateLong(transfer.scheduled_date)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Receiving Location */}
                <section className="md:w-[400px] md:ml-auto md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">TRANSFER TO</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Unit/Dept/Lab
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {formatEnums(transfer.receivingOrganization?.code ?? '—')}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Building (Room)
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {formatEnums(transfer.receivingBuildingRoom?.building?.code ?? '—')} ({transfer.receivingBuildingRoom?.room ?? '—'})
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Date Completed
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {formatDateLong(transfer.actual_transfer_date)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Assets */}
            <div className="mt-8 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <div className="bg-blue-200 px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:bg-neutral-900 dark:text-gray-200">
                    Assets Associated with this Transfer
                </div>
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Code No.</th>
                            <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                            <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                            <th className="px-3 py-2 text-center font-medium">From Sub-Area</th>
                            <th className="px-3 py-2 text-center font-medium">To Sub-Area</th>
                            <th className="px-3 py-2 text-center font-medium">Status</th>
                            <th className="px-3 py-2 text-center font-medium">Date Transferred</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => {
                            const pivot = pivotByAssetId[Number(asset.id)] ?? {};

                                return (
                                    <tr key={asset.id} className="border-t">
                                        <td className="px-3 py-2">{asset.asset_model?.equipment_code?.code ?? '—'}</td>
                                        <td className="px-3 py-2">{formatLabel(asset.asset_name ?? '—')}</td>
                                        <td className="px-3 py-2">{(asset.serial_no ?? '—').toUpperCase()}</td>
                                        <td className="px-3 py-2">{pivot.from_sub_area ?? '—'}</td>
                                        <td className="px-3 py-2">{pivot.to_sub_area ?? '—'}</td>
                                        <td className="px-3 py-2">
                                            <AssetStatusPill status={pivot.asset_transfer_status} />
                                        </td>
                                        <td className="px-3 py-2">{pivot.moved_at ? formatDateLong(pivot.moved_at) : '—'}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>

            {/* Remarks */}
            <div className="flex justify-between items-start mb-1 mt-4">
                {transfer.remarks && (
                    <h4 className="text-sm font-semibold text-gray-800">Remarks:</h4>
                )}
                <p className="text-sm font-medium text-gray-800">
                    <strong>Total Assets:</strong> {assets.length}
                </p>
            </div>

            <div className="mt-2 space-y-2">
                {/* Global transfer remarks */}
                {transfer.remarks && (
                    <p className="text-sm italic text-blue-700">
                        {transfer.remarks?.trim()}
                    </p>
                )}

                {/* Per-asset remarks */}
                {assets.map((asset) => {
                    const pivot = pivotByAssetId[Number(asset.id)];
                    if (!pivot?.remarks) return null;

                    return (
                        <div key={asset.id} className="ml-12 flex items-center gap-2 text-sm">
                            {/* Asset name */}
                            <span className="font-semibold text-blue-700">
                                {formatLabel(asset.asset_name ?? '—')}
                            </span>

                            —

                            {/* Remarks text */}
                            <span className="text-gray-700 italic">{pivot.remarks}</span>
                        </div>
                    );
                })}
            </div>

            <div className="h-2" />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 mt-5 text-sm">
                {transfer.assignedBy?.name && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Prepared By:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-700">{(transfer.assignedBy.name).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 italic">
                            {transfer.assignedBy.role?.name ?? '—'}
                        </p>
                    </div>
                )}

                {transfer.designatedEmployee?.name && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Designated To:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-800">{(transfer.designatedEmployee.name).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 italic">
                            {transfer.designatedEmployee.role?.name ?? '—'}
                        </p>
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
                    <p className="font-bold text-gray-800">{(transfer.approved_by_name)?.toUpperCase() ?? '—'}</p>
                    <p className="text-xs text-gray-500 italic">
                        {transfer.approved_by_role ?? '—'}
                    </p>
                </div>
            </div>
            
            {/* Spacer before footer in print */}
            <div className="hidden print:block h-10" />

            {/* Footer Form Reference */}
            <div className="mt-5 italic text-left text-xs text-gray-500 print:fixed print:bottom-2 print:left-0 print:right-0">
                AUF-FORM-AS/PMO-33 November 22, 2011 Rev. 0
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
