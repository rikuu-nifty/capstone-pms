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

    const humanizeRemarks = (remarks?: string | null) => {
        if (!remarks) return '—';
        const map: Record<string, string> = {
            official_use: 'Official Use',
            repair: 'For Repair',
        };
        return map[remarks] ?? remarks.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

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

    return (
        <ViewModal open={open} onClose={onClose} size="xl" contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden">
            {/* Header */}
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
                        <span className="font-semibold">{humanizeRemarks(offCampus.remarks)}</span>
                    </p>
                </div>
            </div>

            {/* Request Info */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                <section>
                    <h3 className="mb-2 text-base font-semibold">Request Information</h3>
                    <p className="text-sm">
                        <span className="font-semibold">Requester:</span> {offCampus.requester_name}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">College/Unit:</span>{' '}
                        {offCampus.college_or_unit ? `${offCampus.college_or_unit.name} (${offCampus.college_or_unit.code})` : '—'}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Purpose:</span> {offCampus.purpose ?? '—'}
                    </p>
                </section>
                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Issuance Details</h3>
                    <p className="text-sm">
                        <span className="font-semibold">Date Issued:</span> {formatDateLong(offCampus.date_issued)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Return Date:</span> {formatDateLong(offCampus.return_date)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Issued By:</span> {offCampus.issued_by?.name ?? '—'}
                    </p>
                </section>
            </div>

            {/* Assets */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Brand</th>
                            <th className="px-3 py-2 text-center font-medium">Model</th>
                            <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                            <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offCampus.assets?.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.asset?.asset_model?.brand ?? '—'}</td>
                                <td className="px-3 py-2">{a.asset?.asset_model?.model ?? '—'}</td>
                                <td className="px-3 py-2">{a.asset?.asset_name ?? '—'}</td>
                                <td className="px-3 py-2">{a.asset?.serial_no ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Comments */}
            {offCampus.comments && <p className="mt-4 text-sm text-blue-700 italic">{offCampus.comments.trim()}</p>}

            {/* Signatures */}
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
                {offCampus.checked_by && (
                    <div className="text-center">
                        <p className="mb-8 font-semibold">Checked By:</p>
                        <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                        <p className="font-bold text-gray-700">{offCampus.checked_by}</p>
                    </div>
                )}

                {offCampus.approved_by && (
                    <div className="text-center">
                        <p className="mb-8 font-semibold">Approved By:</p>
                        <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                        <p className="font-bold text-gray-700">{offCampus.approved_by}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 text-center print:hidden">
                <a
                    onClick={onClose}
                    className="mr-2 inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black/70"
                >
                    ← Back to Off-Campus
                </a>
                <Button
                    onClick={() => window.print()}
                    className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                >
                    🖨️ Print Form
                </Button>
            </div>
        </ViewModal>
    );
}
