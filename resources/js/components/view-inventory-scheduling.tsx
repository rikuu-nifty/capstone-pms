import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import type { Scheduled } from '@/pages/inventory-scheduling/index';

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
    const s = (status ?? '').toLowerCase();
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

type Props = {
    schedule: Scheduled & { actual_date_of_inventory?: string | null };
    onClose: () => void;
};

export const ViewScheduleModal = ({ schedule, onClose }: Props) => {
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
  <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-200">
    Scheduling
  </h3>
  <p className="text-sm">
    <span className="font-semibold">Inventory Month:</span>{" "}
    {formatMonth(schedule.inventory_schedule)}
  </p>
  <p className="text-sm">
    <span className="font-semibold">Actual Date:</span>{" "}
    {formatDateLong(schedule.actual_date_of_inventory)}
  </p>
</section>
                    </div>

                    {/* People Table */}
                    <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 print:border-gray-300">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-gray-300 print:bg-gray-100 print:text-black">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">Designated Employee</th>
                                    <th className="px-3 py-2 text-left font-medium">Checked By</th>
                                    <th className="px-3 py-2 text-left font-medium">Verified By</th>
                                    <th className="px-3 py-2 text-left font-medium">Received By</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-gray-200 dark:border-gray-800 print:border-gray-300">
                                    <td className="px-3 py-2">{schedule.designated_employee?.name ?? '—'}</td>
                                    <td className="px-3 py-2">{schedule.checked_by ?? '—'}</td>
                                    <td className="px-3 py-2">{schedule.verified_by ?? '—'}</td>
                                    <td className="px-3 py-2">{schedule.received_by ?? '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Assigned By & Remarks */}
                    <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                        {/* Assigned By */}
                        <section className="print:break-inside-avoid">
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">Assigned By:</h3>
                            <div className="mt-6 w-56 border-t border-black" />
                            <div className="mt-1 font-bold">{schedule.assigned_by?.name ?? '—'}</div>
                            <div className="text-[12px] text-gray-500 italic">[Role Here]</div>
                        </section>

                        {/* Remarks */}
                        <section className="md:text-right print:break-inside-avoid">
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">Remarks:</h3>
                            <p className="mt-2 text-sm text-blue-700 italic dark:text-blue-300">{schedule.description?.trim() || '—'}</p>
                        </section>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 text-center print:hidden">
                        <Button className="mr-2" variant="secondary" onClick={() => window.print()}>
                            🖨️ Print Form
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
