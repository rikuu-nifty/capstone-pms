import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import { TurnoverDisposals, InventoryList, AssetModel, formatEnums  } from '@/types/custom-index';
import { DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface TurnoverDisposalViewModalProps {
    open: boolean;
    onClose: () => void;
    turnoverDisposal: TurnoverDisposals;
    assets: InventoryListWithSnake[];
};

export type InventoryListWithSnake = InventoryList & { 
    asset_model?: AssetModel;
};

export default function TurnoverDisposalViewModal({ 
    open,
    onClose, 
    turnoverDisposal,
    assets,
}: 
    TurnoverDisposalViewModalProps
) {
    const recordNo = String(turnoverDisposal.id).padStart(2, '0');

    const formatDateLong = (d?: string | null) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const StatusPill = ({ status }: { status?: string | null }) => {
        const s = (status ?? '').toLowerCase().replace(/_/g, ' ');
        const formattedStatus = s
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const cls =
            s === 'completed'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : s === 'approved'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : s === 'rejected'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : s === 'cancelled'
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        ;

        return (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                {status ? formattedStatus : '—'}
            </span>
        );
    };

    return (
        <ViewModal 
            open={open} 
            onClose={onClose} 
            size="xl" 
            contentClassName=
                "relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden"
        >
            <VisuallyHidden>
                <DialogTitle>Turnover / Disposal Record #{recordNo}</DialogTitle>
            </VisuallyHidden>
            {/* Header */}
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-">
                    <img src="https://www.auf.edu.ph/home/images/mascot/GEN.png" alt="Logo" className="h-25 opacity-90" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">Property Management Office</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>
                <div className="text-right text-sm leading-snug">
                    <p>
                        <span className="text-gray-600 dark:text-gray-400">Record #:</span>{' '}
                        <span className="font-semibold">{recordNo}</span>
                    </p>
                    <p className="mt-1">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>{' '}
                        <span className="font-semibold">{formatEnums(turnoverDisposal.type)}</span>
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <StatusPill status={turnoverDisposal.status} />
                    </p>
                </div>
            </div>

            {/* Offices */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                <section>
                    <h3 className="mb-2 text-base font-semibold">Issuing Office</h3>
                    <p className="text-sm">
                        {/* <span className="font-semibold">Unit/Dept/Lab:</span>{' '} */}
                        {turnoverDisposal.issuing_office?.code ? (
                        <>
                            {turnoverDisposal.issuing_office.name} ({turnoverDisposal.issuing_office.code})
                        </>
                        ) : (
                        '—'
                        )}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Document Date:</span>{' '}
                        {formatDateLong(turnoverDisposal.document_date)}
                    </p>
                </section>

                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Receiving Office</h3>
                    <p className="text-sm">
                        {/* <span className="font-semibold">Unit/Dept/Lab:</span>{' '} */}
                        {turnoverDisposal.receiving_office?.code ? (
                        <>
                            {turnoverDisposal.receiving_office.name} ({turnoverDisposal.receiving_office.code})
                        </>
                        ) : (
                        '—'
                        )}
                    </p>
                    {/* <p className="text-sm">
                        <span className="font-semibold">Document Date:</span>{' '}
                        {formatDateLong(turnoverDisposal.document_date)}
                    </p> */}
                </section>
            </div>
            
            {/* Assets */}
            <div className="mt-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Brand</th>
                            <th className="px-3 py-2 text-center font-medium">Category</th>
                            <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                            <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id} className="border-t">
                                <td className="px-3 py-2">{asset.asset_model?.brand ?? '—'}</td>
                                <td className="px-3 py-2">{asset.asset_model?.category?.name ?? '—'}</td>
                                <td className="px-3 py-2">{asset.asset_name ?? '—'}</td>
                                <td className="px-3 py-2">{asset.serial_no ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dates */}
            {/* <div className="print-footer mt-2 flex justify-between text-sm font-medium print:w-[170mm]">
                <p><span className="font-semibold">Date of Transfer:</span> {formatDateLong(turnoverDisposal.scheduled_date)}</p>
                {turnoverDisposal.document_date && (
                <p className="text-right"><span className="font-semibold">Actual Date:</span> {formatDateLong(transfer.actual_transfer_date)}</p>
                )}
            </div> */}

            <div className="h-2" />

            {/* Description */}
            <div className="flex justify-between items-start mb-1 mt-1">
                <h4 className="text-sm font-semibold text-gray-800">Description:</h4>
                <p className="text-sm font-medium text-gray-800">
                    <strong>Total Assets:</strong> {assets.length}
                </p>
            </div>

            {turnoverDisposal.description && (
                <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">{turnoverDisposal.description?.trim() || '—'}</p>
            )}

            {/* Remarks */}
            <div className="h-4" />

            <div className="flex justify-between items-start mb-1 mt-1">
                <h4 className="text-sm font-semibold text-gray-800">Remarks:</h4>
            </div>

            {turnoverDisposal.remarks && (
                <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">{turnoverDisposal.remarks?.trim() || '—'}</p>
            )}

            <div className="h-4" />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 mt-2 text-sm mb-8">
                {(turnoverDisposal.personnel_in_charge) && (
                    <div className="text-center">
                        <p className="font-semibold mb-8">Personnel In Charge:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold text-gray-700">{turnoverDisposal.personnel_in_charge}</p>
                        <p className="text-xs text-gray-500 italic">[Role Here]</p>
                    </div>
                )}

                {turnoverDisposal.issuing_office?.unit_head && (
                    <div className="text-center">
                        <p className="font-semibold mb-8 invisible aria-hidden=true">Head/Unit:</p>
                        <div className="border-t border-black w-48 mx-auto mb-1" />
                        <p className="font-bold text-gray-800">Head / Unit</p>
                        <p className="text-xs text-gray-500 italic">
                        {turnoverDisposal.issuing_office?.name} ({turnoverDisposal.issuing_office?.code})
                        </p>
                    </div>
                )}

                <div className="text-center">
                    <p className="font-semibold mb-8">Noted By:</p>
                    <div className="border-t border-black w-48 mx-auto mb-1" />
                    <p className="font-bold text-gray-800">{turnoverDisposal.noted_by_name ?? '—'}</p>
                    <p className="text-xs text-gray-500 italic">{turnoverDisposal.noted_by_title ?? 'Dean / Head'}</p>
                </div>
                
                <div className="text-center">
                    <p className="font-semibold mb-8 invisible aria-hidden=true">PMO Head</p>
                    <div className="border-t border-black w-48 mx-auto mb-1" />
                    <p className="font-bold text-gray-800">PMO Head</p>
                    <p className="text-xs text-gray-500 italic">{turnoverDisposal.issuing_office?.name} ({turnoverDisposal.issuing_office?.code})</p>
                </div>
                
            </div>
            
            {/* Actions */}
            <div className="text-center print:hidden mt-3">
                <a
                    onClick={onClose}
                    className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"
                >
                    ← Back to Transfers
                </a>
                {(turnoverDisposal.status !== 'pending_review') && (
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