import ViewModal from '@/components/modals/ViewModal';
import { Button } from '@/components/ui/button';
import type { OffCampus } from './index';

interface OffCampusViewModalProps {
    open: boolean;
    onClose: () => void;
    offCampus: OffCampus;
}

export default function OffCampusViewModal({ open, onClose, offCampus }: OffCampusViewModalProps) {
    const recordNo = String(offCampus.id).padStart(2, '0');

    const formatDateLong = (d?: string | null) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime())
            ? d
            : dt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              });
    };

    const StatusPill = ({ status }: { status?: string | null }) => {
        const s = (status ?? '').toLowerCase().replace(/_/g, ' ');
        const formattedStatus = s
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const cls =
            s === 'returned'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : s === 'pending review'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : s === 'pending return'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : s === 'overdue'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : s === 'cancelled'
                ? 'bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

        return (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                {status ? formattedStatus : '—'}
            </span>
        );
    };

    return (
        <ViewModal open={open} onClose={onClose} size="xl" contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden">
            {/* ---------- Header (kept same as your old UI) ---------- */}
            <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                    <img src="https://www.auf.edu.ph/home/images/mascot/GEN.png" alt="Logo" className="h-20 opacity-90" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">Property Management Office</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>
                <div className="text-right text-sm leading-snug">
                    <p>
                        <span className="text-gray-600 dark:text-gray-400">Off-Campus Record #:</span>{' '}
                        <span className="font-semibold">{recordNo}</span>
                    </p>
                    <p className="mt-1">
                        <span className="text-gray-600 dark:text-gray-400">Remarks:</span>{' '}
                        <span className="font-semibold">
                            {offCampus.remarks === 'official_use' ? 'Official Use' : offCampus.remarks === 'repair' ? 'Repair' : '—'}
                        </span>
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <StatusPill status={offCampus.status} />
                    </p>
                </div>
            </div>

            {/* ---------- Authorization Line (new) ---------- */}
            <div className="mt-4 text-sm">
                <p>
                    This is to authorize Mr./Mrs. <span className="font-semibold">{offCampus.requester_name }</span>,{' '} College/Unit 
                    <span className="font-semibold"> 
                        {offCampus.college_or_unit ? `${offCampus.college_or_unit.name} (${offCampus.college_or_unit.code})` : 'College/Unit _______'}
                    </span>
                    , to bring in / take out from the Angeles University Foundation premises the following properties/equipment described as follows:
                </p>
            </div>

            {/* ---------- Asset Table (like the paper form) ---------- */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 font-medium">QTY</th>
                            <th className="px-3 py-2 font-medium">UNITS</th>
                            <th className="px-3 py-2 font-medium">ITEMS/DESCRIPTION</th>
                            <th className="px-3 py-2 font-medium">COMMENTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offCampus.assets?.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{offCampus.quantity ?? 1}</td>
                                <td className="px-3 py-2">{offCampus.units ?? '—'}</td>
                                <td className="px-3 py-2 text-center">
                                    Item: {a.asset?.asset_name ?? '—'} <br />
                                    Brand: {a.asset?.asset_model?.brand ?? '—'} <br />
                                    Model: {a.asset?.asset_model?.model ?? '—'} <br />
                                    Serial No: {a.asset?.serial_no ?? '—'}
                                </td>
                                <td className="px-3 py-2">{offCampus.comments ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------- Purpose ---------- */}
            <div className="mt-4 border border-gray-200 p-2 dark:border-gray-800">
                <p className="text-sm">
                    <span className="font-semibold">Purpose:</span> {offCampus.purpose ?? '—'}
                </p>
            </div>

            {/* ---------- Return Responsibility Note ---------- */}
            <p className="mt-4 text-xs text-gray-600 italic">
                Above item shall be returned to the University on or before {formatDateLong(offCampus.return_date)}. The requester will be responsible
                for any damages incurred while the items are in his/her possession.
            </p>

            {/* ---------- Remarks (checkbox style) ---------- */}
            <div className="mt-4">
                <p className="text-sm font-semibold">Remarks: Approved for release for</p>
                <p className="text-sm">
                    [ {offCampus.remarks === 'official_use' ? '✔' : ' '} ] OFFICIAL USE &nbsp;&nbsp; [ {offCampus.remarks === 'repair' ? '✔' : ' '}{' '}
                    ] REPAIR
                </p>
            </div>

            {/* ---------- Signatures (reordered per paper form) ---------- */}
            <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
                <div className="text-center">
                    <p className="mb-8 font-semibold">Requester (Name of Personnel)</p>
                    <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                    <p className="font-bold text-gray-700">{offCampus.requester_name}</p>
                </div>
                <div className="text-center">
                    <p className="mb-8 font-semibold">Issued By (Head, PMO)</p>
                    <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                    <p className="font-bold text-gray-700">{offCampus.issued_by?.name ?? '—'}</p>
                </div>
                <div className="text-center">
                    <p className="mb-8 font-semibold">Checked By (Chief, Security Service)</p>
                    <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                    <p className="font-bold text-gray-700">{offCampus.checked_by ?? '—'}</p>
                </div>
                <div className="text-center">
                    <p className="mb-8 font-semibold">Approved By (Dean/Head Concerned)</p>
                    <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                    <p className="font-bold text-gray-700 capitalize">{offCampus.approved_by ?? '—'}</p>
                </div>
            </div>

            {/* ---------- Actions ---------- */}
            <div className="mt-6 text-center print:hidden">
                <a
                    onClick={onClose}
                    className="mr-2 inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black/70"
                >
                    ← Back to Off-Campus
                </a>
                {(offCampus.status !== 'pending_review') && (
                    <Button
                        onClick={() => window.print()}
                        className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                    >
                        🖨️ Print Form
                    </Button>
                )}
            </div>
        </ViewModal>
    );
}
