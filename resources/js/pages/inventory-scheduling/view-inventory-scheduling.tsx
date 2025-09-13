import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import type { Scheduled } from '@/pages/inventory-scheduling/index';
import { formatUnderscore } from '@/types/custom-index';
import { Asset } from '../inventory-list';

const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime())
        ? d
        : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatMonth = (ym?: string | null) => {
    if (!ym) return '—';
    const [y, m] = ym.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
            {status ? s[0].toUpperCase() + s.slice(1) : '—'}
        </span>
    );
};

type Signatory = {
    role_key: string;
    name: string;
    title: string;
};

type Props = {
    schedule: Scheduled & { actual_date_of_inventory?: string | null };
    onClose: () => void;
    signatories: Record<string, Signatory>;
    assets: Asset[];
};

export const ViewScheduleModal = ({ schedule, onClose, signatories }: Props) => {
    const recordNo = String(schedule.id).padStart(2, '0');

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[min(1100px,95vw)] max-w-none overflow-hidden p-0 sm:max-w-[1100px]">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                        </div>
                        <div className="text-right text-sm leading-snug">
                        <p>
                            <span className="text-gray-600 dark:text-gray-400">Schedule Record #:</span>{' '}
                            <span className="font-semibold">{recordNo}</span>
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-2">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <StatusPill status={schedule.scheduling_status} />
                        </p>
                        </div>
                    </div>

                    {/* Scope + Scheduling Info */}
                    <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                        {/* Scope Info */}
                        <section className="md:w-[400px]">
                            <h3 className="mb-2 text-base font-semibold">Scope Information</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Scope Type
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {schedule.scope_type === 'unit'
                                                ? 'By Units / Departments'
                                                : 'By Buildings'}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Units
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {schedule.units?.length ?? 0}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Buildings
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {schedule.buildings?.length ?? 0}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Scheduling Info */}
                        <section className="md:w-[400px] md:ml-auto md:text-right print:justify-self-end print:text-right">
                            <h3 className="mb-2 text-base font-semibold">Scheduling Information</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Inventory Month
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {formatMonth(schedule.inventory_schedule)}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Actual Date
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {formatDateLong(schedule.actual_date_of_inventory)}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Rooms
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {schedule.rooms?.length ?? 0}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Sub-Areas
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {schedule.sub_areas?.length ?? 0}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Pivot Table */}
                    {/* <div className="mt-8 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                    <div className="bg-blue-200 px-4 py-2 text-center text-sm font-semibold text-gray-800 dark:bg-neutral-900 dark:text-gray-200">
                        Scope Records Associated with this Schedule
                    </div>
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border px-2 py-1 w-10 text-center">#</th>
                            <th className="border px-2 py-1 text-center">Unit / Department</th>
                            <th className="border px-2 py-1 text-center">Building</th>
                            <th className="border px-2 py-1 text-center">Room</th>
                            <th className="border px-2 py-1 text-center">Sub-Area</th>
                            <th className="border px-2 py-1 text-center">Inventory Schedule</th>
                            <th className="border px-2 py-1 text-center">Actual Date</th>
                            <th className="border px-2 py-1 text-center">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(() => {
                            let counter = 1;
                            const rows: {
                            unit?: string;
                            building?: string;
                            room?: string;
                            sub_area?: string;
                            }[] = [];

                            (schedule.units?.length ? schedule.units : [null]).forEach((u) => {
                            const unitName = u?.name ?? null;
                            const buildings = schedule.units?.length
                                ? (schedule.buildings ?? [])
                                : (schedule.buildings ?? []);

                            buildings.forEach((b) => {
                                const rooms = (schedule.rooms ?? []).filter((r) => r.building_id === b.id);
                                if (rooms.length === 0) {
                                rows.push({ unit: unitName ?? undefined, building: b.name });
                                return;
                                }
                                rooms.forEach((r) => {
                                const subAreas = (schedule.sub_areas ?? []).filter(
                                    (sa) => sa.building_room_id === r.id
                                );
                                if (subAreas.length === 0) {
                                    rows.push({
                                    unit: unitName ?? undefined,
                                    building: b.name,
                                    room: String(r.room),
                                    });
                                    return;
                                }
                                subAreas.forEach((sa) => {
                                    rows.push({
                                    unit: unitName ?? undefined,
                                    building: b.name,
                                    room: String(r.room),
                                    sub_area: sa.name,
                                    });
                                });
                                });
                            });
                            });

                            return rows.length > 0 ? (
                            rows.map((row, idx) => {
                                const prev = rows[idx - 1];
                                const next = rows[idx + 1];

                                return (
                                <tr key={idx}>
                                    <td className="border px-2 py-1 text-center align-middle">
                                    {counter++}
                                    </td>

                                    <td
                                    className={`px-2 py-1 text-center align-middle border-r ${
                                        prev?.unit === row.unit ? 'border-t-0' : 'border-t'
                                    } ${
                                        next?.unit === row.unit ? 'border-b-0' : 'border-b'
                                    }`}
                                    >
                                    {prev?.unit === row.unit ? '' : row.unit ?? '—'}
                                    </td>

                                    <td
                                    className={`px-2 py-1 text-center align-middle border-r ${
                                        prev?.building === row.building ? 'border-t-0' : 'border-t'
                                    } ${
                                        next?.building === row.building ? 'border-b-0' : 'border-b'
                                    }`}
                                    >
                                    {prev?.building === row.building ? '' : row.building ?? '—'}
                                    </td>

                                    <td
                                    className={`px-2 py-1 text-center align-middle border-r ${
                                        prev?.room === row.room ? 'border-t-0' : 'border-t'
                                    } ${
                                        next?.room === row.room ? 'border-b-0' : 'border-b'
                                    }`}
                                    >
                                    {prev?.room === row.room ? '' : row.room ?? '—'}
                                    </td>

                                    <td className="border px-2 py-1 text-center align-middle">
                                    {row.sub_area ?? '—'}
                                    </td>

                                    <td className="border px-2 py-1 text-center align-middle">
                                    {formatMonth(schedule.inventory_schedule)}
                                    </td>

                                    <td className="border px-2 py-1 text-center align-middle">
                                    {formatDateLong(schedule.actual_date_of_inventory)}
                                    </td>

                                    <td className="border px-2 py-1 text-center align-middle">
                                    {schedule.scheduling_status}
                                    </td>
                                </tr>
                                );
                            })
                            ) : (
                            <tr>
                                <td
                                colSpan={8}
                                className="border px-2 py-4 text-center text-muted-foreground"
                                >
                                No scope records found.
                                </td>
                            </tr>
                            );
                        })()}
                        </tbody>
                    </table>
                    </div> */}
                    {/* Pivot Table (grouped with faux-merged cells + asset counts) */}
<div className="mt-8 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
  <div className="bg-blue-200 px-4 py-2 text-center text-sm font-semibold text-gray-800 dark:bg-neutral-900 dark:text-gray-200">
    Scope Records Associated with this Schedule
  </div>
  <table className="w-full text-sm border-collapse">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="border px-2 py-1 w-10 text-center">#</th>
        <th className="border px-2 py-1 text-center">Unit / Department</th>
        <th className="border px-2 py-1 text-center">Building</th>
        <th className="border px-2 py-1 text-center">Room</th>
        <th className="border px-2 py-1 text-center">Sub-Area</th>
        <th className="border px-2 py-1 text-center">Inventory Schedule</th>
        <th className="border px-2 py-1 text-center">Actual Date</th>
        <th className="border px-2 py-1 text-center">Status</th>
        <th className="border px-2 py-1 text-center">Assets</th>
      </tr>
    </thead>
    <tbody>
      {(() => {
        let counter = 1;
        const rows: {
          unit?: string;
          building?: string;
          room?: string;
          sub_area?: string;
          assetCount?: number;
        }[] = [];

        // Flatten hierarchy (unit → building → room → subarea)
        (schedule.units?.length ? schedule.units : [null]).forEach((u) => {
          const unitName = u?.name ?? null;
          const buildings = schedule.units?.length
            ? (schedule.buildings ?? [])
            : (schedule.buildings ?? []);

          buildings.forEach((b) => {
            const rooms = (schedule.rooms ?? []).filter((r) => r.building_id === b.id);
            if (rooms.length === 0) {
              rows.push({ unit: unitName ?? undefined, building: b.name });
              return;
            }
            rooms.forEach((r) => {
              const subAreas = (schedule.sub_areas ?? []).filter(
                (sa) => sa.building_room_id === r.id
              );

              if (subAreas.length === 0) {
                // Count assets directly by room
                const assetCount = (schedule.assets ?? []).filter(
                    (a) => a.asset?.building_room_id === r.id
                ).length;


                rows.push({
                  unit: unitName ?? undefined,
                  building: b.name,
                  room: String(r.room),
                  assetCount,
                });
                return;
              }

              subAreas.forEach((sa) => {
                // Count assets by sub-area
                const assetCount = (schedule.assets ?? []).filter(
                    (a) => a.asset?.sub_area_id === sa.id
                ).length;

                rows.push({
                  unit: unitName ?? undefined,
                  building: b.name,
                  room: String(r.room),
                  sub_area: sa.name,
                  assetCount,
                });
              });
            });
          });
        });

        return rows.length > 0 ? (
          rows.map((row, idx) => {
            const prev = rows[idx - 1];
            const next = rows[idx + 1];

            return (
              <tr key={idx}>
                {/* Counter */}
                <td className="border px-2 py-1 text-center align-middle">
                  {counter++}
                </td>

                {/* Unit */}
                <td
                  className={`px-2 py-1 text-center align-middle border-r ${
                    prev?.unit === row.unit ? 'border-t-0' : 'border-t'
                  } ${
                    next?.unit === row.unit ? 'border-b-0' : 'border-b'
                  }`}
                >
                  {prev?.unit === row.unit ? '' : row.unit ?? '—'}
                </td>

                {/* Building */}
                <td
                  className={`px-2 py-1 text-center align-middle border-r ${
                    prev?.building === row.building ? 'border-t-0' : 'border-t'
                  } ${
                    next?.building === row.building ? 'border-b-0' : 'border-b'
                  }`}
                >
                  {prev?.building === row.building ? '' : row.building ?? '—'}
                </td>

                {/* Room */}
                <td
                  className={`px-2 py-1 text-center align-middle border-r ${
                    prev?.room === row.room ? 'border-t-0' : 'border-t'
                  } ${
                    next?.room === row.room ? 'border-b-0' : 'border-b'
                  }`}
                >
                  {prev?.room === row.room ? '' : row.room ?? '—'}
                </td>

                {/* Sub-Area */}
                <td className="border px-2 py-1 text-center align-middle">
                  {row.sub_area ?? '—'}
                </td>

                {/* Inventory Schedule */}
                <td className="border px-2 py-1 text-center align-middle">
                  {formatMonth(schedule.inventory_schedule)}
                </td>

                {/* Actual Date */}
                <td className="border px-2 py-1 text-center align-middle">
                  {formatDateLong(schedule.actual_date_of_inventory)}
                </td>

                {/* Status */}
                <td className="border px-2 py-1 text-center align-middle">
                  {schedule.scheduling_status}
                </td>

                {/* Assets */}
                <td className="border px-2 py-1 text-center align-middle">
                  {row.assetCount ?? '—'}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              colSpan={9}
              className="border px-2 py-4 text-center text-muted-foreground"
            >
              No scope records found.
            </td>
          </tr>
        );
      })()}
    </tbody>
  </table>
</div>


                    {/* Signatories */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-5 mt-5 text-sm">
                        <div className="text-center">
                            <p className="font-semibold mb-8">Prepared By:</p>
                            <div className="border-t border-black w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">{schedule.prepared_by?.name ?? '—'}</p>
                            <p className="text-xs text-gray-500 italic">
                                {schedule.prepared_by?.role_name ?? 'Property Clerk'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-8">Approved By:</p>
                            <div className="border-t border-black w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some(
                                (s) => s.code === 'approved_by' && s.status === 'approved'
                                )
                                ? signatories['approved_by']?.name
                                : '—'}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                                {signatories['approved_by']?.title ?? 'VP for Administration'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-8">Received By:</p>
                            <div className="border-t border-black w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {signatories['received_by']?.name ?? '—'}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                                {signatories['received_by']?.title ?? 'Internal Auditor'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-8">Noted By:</p>
                            <div className="border-t border-black w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some(
                                (s) => s.code === 'noted_by' && s.status === 'approved'
                                )
                                ? signatories['noted_by']?.name
                                : '—'}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                                {signatories['noted_by']?.title ?? 'Head, Property Management'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="text-center print:hidden mt-6">
                        <DialogClose asChild>
                            <Button variant="outline" className="mr-2">
                                ← Back to Schedules
                            </Button>
                        </DialogClose>
                        {schedule.scheduling_status.toLowerCase() !== 'pending_review' && (
                            <Button
                                onClick={() => window.print()}
                                className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                            >
                                🖨️ Print Form
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

