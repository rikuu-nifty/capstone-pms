import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import type { Scheduled } from '@/pages/inventory-scheduling/index';
import { formatUnderscore } from '@/types/custom-index';
import { Asset } from '../inventory-list';

const formatMonth = (ym?: string | null) => {
    if (!ym) return '—';
    const [y, m] = ym.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const StatusPill = ({ status }: { status?: string | null }) => {
    const s = formatUnderscore(status ?? '');
    const cls =
        s === 'completed'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : s === 'pending'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : s === 'overdue'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status ? s[0].toUpperCase() + s.slice(1) : '—'}</span>
    );
};
// --------------------------------------------------------------

type Signatory = {
    role_key: string;
    name: string;
    title: string;
};

type Props = {
    schedule: Scheduled & { actual_date_of_inventory?: string | null };
    onClose: () => void;
    assets: Asset[]; // 👈 add this
    signatories: Record<string, Signatory>; // ✅ now dynamic signatories are injected from backend
};

export const ViewScheduleModal = ({ schedule, onClose, assets, signatories }: Props) => {
    const buildingCode = schedule.building?.code ?? '—';
    const buildingName = schedule.building?.name ?? '—';
    const room = schedule.building_room?.room?.toString() ?? '—';
    const unitCode = schedule.unit_or_department?.code ?? '—';
    const unitName = schedule.unit_or_department?.name ?? '';

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[min(1100px,95vw)] max-w-none overflow-hidden p-0 sm:max-w-[1100px] print:!w-full print:!max-w-none print:!overflow-visible print:!rounded-none print:!border-0 print:!p-0 print:!shadow-none">
                <div className="print-force-light bg-white p-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
                    {/* Header */}
                    <div className="relative flex items-center justify-between">
                        {/* Left side - Logo */}
                        <div className="flex items-center gap-4">
                            <img src="https://www.auf.edu.ph/home/images/mascot/GEN.png" alt="Logo" className="h-24 opacity-90" />
                        </div>

                        {/* Center - Office Info */}
                        <div className="absolute left-1/2 -translate-x-1/2 text-center">
                            <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">Property Management Office</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                        </div>

                        {/* Right side - Status */}
                        <div className="text-right text-sm leading-snug">
                            <p>
                                <span className="text-gray-600 dark:text-gray-400">Schedule Record #:</span>{' '}
                                <span className="font-semibold">{String(schedule.id).padStart(2, '0')}</span>
                            </p>
                            <p className="mt-1 flex items-center justify-end gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <StatusPill status={schedule.scheduling_status} />
                            </p>
                        </div>
                    </div>

                    {/* Location + Schedule Info */}
                    <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                        {/* Location */}
                        <section className="print:break-inside-avoid">
                            <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-200">Location</h3>
                            <p className="text-sm">
                                <span className="font-semibold">Building:</span> {buildingName} ({buildingCode})
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Room:</span> {room}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Unit/Dept/Lab:</span> {unitCode}
                                {unitName ? ` — ${unitName}` : ''}
                            </p>
                        </section>

                        {/* Scheduling */}
                        <section className="w-full text-right print:break-inside-avoid">
                            <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-200">Scheduling</h3>
                            <p className="text-sm">
                                <span className="font-semibold">Inventory Month:</span> {formatMonth(schedule.inventory_schedule)}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Actual Date:</span> {formatDateLong(schedule.actual_date_of_inventory)}
                            </p>
                        </section>
                    </div>

                    {/* Assets Table */}
                    <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-center font-medium">ID</th>
                                    <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                                    <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                                    <th className="px-3 py-2 text-center font-medium">Category</th>
                                    <th className="px-3 py-2 text-center font-medium">Model / Brand</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.length > 0 ? (
                                    assets.map((a) => (
                                        <tr key={a.id} className="border-t">
                                            <td className="px-3 py-2">{a.id}</td>
                                            <td className="px-3 py-2">{a.asset_name}</td>
                                            <td className="px-3 py-2">{a.serial_no || '—'}</td>
                                            <td className="px-3 py-2">{a.category?.name || '—'}</td>
                                            <td className="px-3 py-2">{a.asset_model ? `${a.asset_model.brand} ${a.asset_model.model}` : '—'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                                            No assets found for this building/room/department.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Assigned By & Remarks (kept commented out) */}

                    <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
                        {/* Prepared By (signatory) */}
                        {/* <div className="text-center">
                            <p className="font-semibold mb-8">Prepared By:</p>
                            <div className="border-t border-black w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">{signatories['prepared_by']?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{signatories['prepared_by']?.title ?? '—'}</p>
                        </div> */}

                        {/* Prepared By */}
                        <div className="text-center">
                            <p className="mb-8 font-semibold">Prepared By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">{schedule.prepared_by?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{schedule.prepared_by?.role_name ?? 'Property Clerk'}</p>
                        </div>
                        {/* Approved By (VP Admin) */}
                        <div className="text-center">
                            <p className="mb-8 font-semibold">Approved By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some((s) => s.code === 'approved_by' && s.status === 'approved')
                                    ? signatories['approved_by']?.name
                                    : '—'}
                            </p>
                            <p className="text-xs text-gray-500 italic">{signatories['approved_by']?.title ?? 'VP for Administration'}</p>
                        </div>

                        {/* Received By (Internal Auditor) – always visible */}
                        <div className="text-center">
                            <p className="mb-8 font-semibold">Received By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">{signatories['received_by']?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{signatories['received_by']?.title ?? 'Internal Auditor'}</p>
                        </div>

                        {/* Noted By (PMO Head) */}
                        <div className="text-center">
                            <p className="mb-8 font-semibold">Noted By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some((s) => s.code === 'noted_by' && s.status === 'approved')
                                    ? signatories['noted_by']?.name
                                    : '—'}
                            </p>
                            <p className="text-xs text-gray-500 italic">{signatories['noted_by']?.title ?? 'Head, Property Management'}</p>
                        </div>
                        {/* Approved By (signatory) */}
                        {/* <div className="text-center">
                            <p className="mb-8 font-semibold">Approved By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">{signatories['approved_by']?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{signatories['approved_by']?.title ?? '—'}</p>
                        </div> */}

                        {/* Received By (signatory) */}
                        {/* <div className="text-center">
                            <p className="mb-8 font-semibold">Received By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">{signatories['received_by']?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{signatories['received_by']?.title ?? '—'}</p>
                        </div> */}

                        {/* Noted By (signatory) */}
                        {/* <div className="text-center">
                            <p className="mb-8 font-semibold">Noted By:</p>
                            <div className="mx-auto mb-1 w-48 border-t border-black"></div>
                            <p className="font-bold text-gray-700 uppercase">{signatories['noted_by']?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">{signatories['noted_by']?.title ?? '—'}</p>
                        </div> */}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 text-center print:hidden">
                        {schedule.scheduling_status.toLowerCase() !== 'pending_review' && (
                            <Button className="mr-2" variant="secondary" onClick={() => window.print()}>
                                🖨️ Print Form
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
