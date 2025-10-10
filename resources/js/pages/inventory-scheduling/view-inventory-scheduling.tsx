import Pagination, { PageInfo } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { Scheduled } from '@/pages/inventory-scheduling/index';
import { formatEnums } from '@/types/custom-index';
import { router } from '@inertiajs/react';
// import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Asset } from '../inventory-list';
import ViewRowAssetModal from './ViewRowAssetsModal';

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

const formatMonth = (ym?: string | null) => {
    if (!ym) return '—';
    const [y, m] = ym.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const StatusPill = ({ status }: { status?: string | null }) => {
    const s = status ?? '';
    const cls =
        s === 'completed'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : s === 'in_progress'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              : s === 'scheduled'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : s === 'overdue'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

    return (
        <span
        className={`
            inline-flex justify-center
            rounded-full text-[10px] sm:text-xs font-medium
            px-2 py-0.5 sm:px-2.5
            max-w-fit self-end sm:self-auto
            ${cls}
        `}
        >
        {status ? formatEnums(s) : '—'}
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

export type AssetWithStatus = Asset & {
    inventory_status: string;
};

type Row = {
    unit?: string;
    unit_id?: number | null;
    building?: string;
    room?: string;
    sub_area?: string;
    assetCount?: number;
    status?: string;
    sub_area_id?: number;
    building_room_id?: number;
};

type RowSpanInfo = {
    unitSpan: number;
    buildingSpan: number;
    roomSpan: number;
    subAreaSpan: number;
};

export const ViewScheduleModal = ({ schedule, onClose, signatories }: Props) => {
    const [rowAssets, setRowAssets] = useState<{
        scheduleId: number;
        rowId: number;
        type: 'building_room' | 'sub_area';
        title: string;
        unitId?: number | null;
    } | null>(null);

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const [refreshing, setRefreshing] = useState(false);

    const refreshSchedule = () => {
        setRefreshing(true);
        router.reload({
            only: ['viewing', 'signatories', 'assets'],
            onFinish: () => setRefreshing(false),
        });
    };

    const computeRowStatus = (assets: { inventory_status: string }[], actualDate?: string | null, scheduledMonth?: string | null) => {
        if (!assets.length) return 'pending';

        const allInventoried = assets.every((a) => a.inventory_status === 'inventoried');
        if (allInventoried) return 'completed';

        const allScheduled = assets.every((a) => a.inventory_status === 'scheduled');
        if (allScheduled) {
            if (scheduledMonth) {
                const [y, m] = scheduledMonth.split('-').map(Number);
                const scheduleEnd = new Date(y, m, 0);
                if (new Date() > scheduleEnd) return 'overdue';
            }
            return 'pending';
        }

        const allNotInventoried = assets.every((a) => a.inventory_status === 'not_inventoried');
        if (allNotInventoried) return 'not_inventoried';

        // If mixed → in_progress
        return 'in_progress';
    };

    const rows: Row[] = (() => {
        const list: Row[] = [];

        (schedule.units?.length ? schedule.units : [null]).forEach((u) => {
            const unitName = u?.name ?? null;
            const buildings = schedule.buildings ?? [];

            buildings.forEach((b) => {
                const rooms = (schedule.rooms ?? []).filter((r) => r.building_id === b.id);

                rooms.forEach((r) => {
                    const subAreas = (schedule.sub_areas ?? []).filter((sa) => sa.building_room_id === r.id);

                    if (subAreas.length === 0) {
                        const assetsHere = (schedule.assets ?? [])
                            .filter((a) => {
                                const matchRoom = a.asset?.building_room_id === r.id;
                                const matchUnit = schedule.scope_type === 'unit' ? a.asset?.unit_or_department_id === u?.id : true;
                                return matchRoom && matchUnit;
                            })
                            .map((a) => ({ ...a.asset!, inventory_status: a.inventory_status }));

                        list.push({
                            unit: unitName ?? undefined,
                            unit_id: u?.id ?? null,
                            building: b.name,
                            room: String(r.room),
                            sub_area: '—',
                            assetCount: assetsHere.length,
                            status: computeRowStatus(assetsHere, schedule.actual_date_of_inventory, schedule.inventory_schedule),
                            building_room_id: r.id,
                        });
                    } else {
                        subAreas.forEach((sa) => {
                            const assetsHere = (schedule.assets ?? [])
                                .filter((a) => {
                                    const matchSubArea = a.asset?.sub_area_id === sa.id;
                                    const matchUnit = schedule.scope_type === 'unit' ? a.asset?.unit_or_department_id === u?.id : true;
                                    return matchSubArea && matchUnit;
                                })
                                .map((a) => ({ ...a.asset!, inventory_status: a.inventory_status }));

                            list.push({
                                unit: unitName ?? undefined,
                                unit_id: u?.id ?? null,
                                building: b.name,
                                room: String(r.room),
                                sub_area: sa.name,
                                assetCount: assetsHere.length,
                                status: computeRowStatus(assetsHere, schedule.actual_date_of_inventory, schedule.inventory_schedule),
                                sub_area_id: sa.id,
                            });
                        });

                        const leftoverAssets = (schedule.assets ?? [])
                            .filter((a) => {
                                const matchRoom = a.asset?.building_room_id === r.id;
                                const noSubArea = !a.asset?.sub_area_id;
                                const matchUnit = schedule.scope_type === 'unit' ? a.asset?.unit_or_department_id === u?.id : true;
                                return matchRoom && noSubArea && matchUnit;
                            })
                            .map((a) => ({ ...a.asset!, inventory_status: a.inventory_status }));

                        if (leftoverAssets.length > 0) {
                            list.push({
                                unit: unitName ?? undefined,
                                unit_id: u?.id ?? null,
                                building: b.name,
                                room: String(r.room),
                                sub_area: '—',
                                assetCount: leftoverAssets.length,
                                status: computeRowStatus(leftoverAssets, schedule.actual_date_of_inventory, schedule.inventory_schedule),
                                building_room_id: r.id,
                            });
                        }
                    }
                });
            });
        });

        // return list;
        // remove rows with 0 assets
        return list.filter((r) => (r.assetCount ?? 0) > 0);
    })();

    const total = rows.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = rows.slice(start, start + PAGE_SIZE);

    function computeRowSpans(data: Row[]): RowSpanInfo[] {
        const spans: RowSpanInfo[] = data.map(() => ({
            unitSpan: 0,
            buildingSpan: 0,
            roomSpan: 0,
            subAreaSpan: 0,
        }));

        for (let i = 0; i < data.length; i++) {
            if (i === 0 || data[i].unit !== data[i - 1].unit) {
                let count = 1;
                for (let j = i + 1; j < data.length; j++) {
                    if (data[j].unit === data[i].unit) count++;
                    else break;
                }
                spans[i].unitSpan = count;
            }

            if (i === 0 || data[i].unit !== data[i - 1].unit || data[i].building !== data[i - 1].building) {
                let count = 1;
                for (let j = i + 1; j < data.length; j++) {
                    if (data[j].unit === data[i].unit && data[j].building === data[i].building) count++;
                    else break;
                }
                spans[i].buildingSpan = count;
            }

            if (i === 0 || data[i].unit !== data[i - 1].unit || data[i].building !== data[i - 1].building || data[i].room !== data[i - 1].room) {
                let count = 1;
                for (let j = i + 1; j < data.length; j++) {
                    if (data[j].unit === data[i].unit && data[j].building === data[i].building && data[j].room === data[i].room) count++;
                    else break;
                }
                spans[i].roomSpan = count;
            }

            if (
                i === 0 ||
                data[i].unit !== data[i - 1].unit ||
                data[i].building !== data[i - 1].building ||
                data[i].room !== data[i - 1].room ||
                data[i].sub_area !== data[i - 1].sub_area
            ) {
                let count = 1;
                for (let j = i + 1; j < data.length; j++) {
                    if (
                        data[j].unit === data[i].unit &&
                        data[j].building === data[i].building &&
                        data[j].room === data[i].room &&
                        data[j].sub_area === data[i].sub_area
                    )
                        count++;
                    else break;
                }
                spans[i].subAreaSpan = count;
            }
        }

        return spans;
    }

    const spans = computeRowSpans(pageItems);
    const recordNo = String(schedule.id).padStart(2, '0');

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            {/* <DialogContent className="w-[min(1000px,95vw)] max-w-none max-h-[90vh] overflow-y-auto p-0 sm:max-w-[1100px]"> */}
            <DialogContent
                className="w-[350px] max-w-[95vw] h-[90vh] sm:h-auto sm:w-[min(1000px,95vw)] sm:max-w-[1100px] overflow-y-auto p-0"
            >
                <DialogHeader>
                    <DialogTitle>
                        <VisuallyHidden>Schedule Record #{recordNo}</VisuallyHidden>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Detailed view of schedule record #{recordNo}
                    </DialogDescription>
                </DialogHeader>
                <div className="print-force-light bg-white p-4 sm:p-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
                {/* Header */}
                    <div className="mx-auto w-[320px] sm:w-full sm:max-w-none relative flex items-center justify-between">
                        <div className="flex items-center flex-shrink-0">
                            <img
                                src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                                alt="Logo"
                                className="h-16 md:h-24 opacity-90"
                            />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 text-center w-[150px] md:w-full">
                            <h2 className="text-xs sm:text-sm md:text-2xl font-bold tracking-wide uppercase print:text-lg">
                                Angeles University Foundation
                            </h2>
                            <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                                Property Management Office
                            </p>
                            <p className="text-[10px] sm:text-sm text-gray-800 dark:text-gray-400 print:text-xs font-bold">
                                {(() => {
                                    const currentYear = new Date().getFullYear();
                                    const prevYear = currentYear - 1;
                                    return `MONITORING/SCHEDULE OF INVENTORY AY ${prevYear}-${currentYear}`;
                                })()}
                            </p>
                        </div>
                        <div className="text-right text-[9px] w-[70px] md:w-full md:text-sm leading-snug">
                            <p>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Schedule Record #:
                                </span>{' '}
                                <span className="font-semibold">{recordNo}</span>
                            </p>
                            <p className="mt-1 flex flex-col sm:flex-row sm:items-center justify-end sm:justify-end gap-1 sm:gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <StatusPill status={schedule.scheduling_status} />
                            </p>
                        </div>
                    </div>

                    <h2 className="mt-4 mb-4 text-center text-base sm:text-lg md:text-xl font-bold tracking-wide text-gray-900 dark:text-gray-100 underline">
                        Inventory Scheduling
                    </h2>

                    {/* Scope + Scheduling Info */}
                    {/* <div className="mt-6 grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-12 print:grid-cols-2"> */}
                        {/* Scope Info */}
                        {/* <section className="md:w-[400px] w-[320px]">
                            <h3 className="mb-2 text-sm md:text-base font-semibold">Scope Information</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full table-auto text-xs md:text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="w-1/2 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Buildings
                                            </td>
                                            <td className="px-3 py-2 font-medium text-right">
                                                {schedule.buildings?.length ?? 0}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <td className="w-1/2 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Rooms
                                            </td>
                                            <td className="px-3 py-2 font-medium text-right">
                                                {schedule.rooms?.length ?? 0}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/2 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                                Sub-Areas
                                            </td>
                                            <td className="px-3 py-2 font-medium text-right">
                                                {schedule.sub_areas?.length ?? 0}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section> */}

                        {/* Scheduling Info */}
                        {/* <section className="w-[320px] md:w-[400px] md:ml-auto md:text-right print:justify-self-end print:text-right">
                            <h3 className="mb-2 text-sm md:text-base font-semibold">Scheduling Information</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                <table className="w-full table-auto text-xs md:text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                            Inventory Month
                                        </td>
                                        <td className="px-3 py-2 font-medium text-right truncate whitespace-normal break-words ">
                                            {formatMonth(schedule.inventory_schedule)}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                            Actual Date of Inventory
                                        </td>
                                        <td className="px-3 py-2 font-medium text-right truncate whitespace-normal break-words ">
                                            {formatDateLong(schedule.actual_date_of_inventory)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                            Total Assets
                                        </td>
                                        <td className="px-3 py-2 font-medium text-right truncate whitespace-normal break-words ">
                                            {schedule.assets?.length ?? 0}
                                        </td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>
                        </section> */}
                    {/* </div> */}

                    {/* Pivot Table */}
                    <div className="w-[320px] md:w-full mt-8 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        {/* <div className="flex items-center justify-between bg-blue-200 px-4 py-2 text-sm font-semibold text-gray-800 dark:bg-neutral-900 dark:text-gray-200">
                            <span>Inventory Sheet Scheduling</span>
                            <Button
                                onClick={refreshSchedule}
                                disabled={refreshing}
                                variant="primary"
                                // size="sm"
                                className="
                                    flex items-center gap-1 cursor-pointer 
                                    text-xs px-2 py-1
                                    sm:gap-2 sm:text-sm sm:px-3 sm:py-2
                                "
                            >
                                <RotateCcw
                                    className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`}
                                />
                                {refreshing ? 'Refreshing…' : 'Refresh'}
                            </Button>
                        </div> */}

                        <div className="overflow-x-auto">
                            <table className="md:w-full text-xs md:text-sm border-collapse">
                                <thead className="md:min-w-[600px] bg-gray-100 text-gray-700">
                                    <tr>
                                        {/* <th className="border px-2 py-1 w-10 text-center">#</th> */}
                                        <th className="border px-2 py-1 text-center">Unit/Dept/Labs</th>
                                        <th className="border px-2 py-1 text-center">Buildings</th>
                                        <th className="border px-2 py-1 text-center">Rooms</th>
                                        <th className="border px-2 py-1 text-center">Inventory Schedule</th>
                                        <th className="border px-2 py-1 text-center">Actual Date of Inventory</th>
                                        
                                        {/* <th className="border px-2 py-1 text-center">Sub-Areas</th> */}
                                        <th className="border px-2 py-1 text-center">Status</th>
                                        {/* <th className="border px-2 py-1 text-center">Asset Count</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.length > 0 ? (
                                        pageItems.map((row, idx) => {
                                            const s = spans[idx];
                                            return (
                                                <tr key={start + idx}>
                                                    {/* <td className="border px-2 py-1 text-center">
                                                        {start + idx + 1}
                                                    </td> */}

                                                    {s.unitSpan > 0 && (
                                                        <td
                                                            rowSpan={s.unitSpan}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            {row.unit ?? '—'}
                                                        </td>
                                                    )}
                                                    {s.buildingSpan > 0 && (
                                                        <td
                                                            rowSpan={s.buildingSpan}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            {row.building ?? '—'}
                                                        </td>
                                                    )}
                                                    {s.roomSpan > 0 && (
                                                        <td
                                                            rowSpan={s.roomSpan}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            {row.room ?? '—'}
                                                        </td>
                                                    )}
                                                    <td
                                                        className="border px-2 py-1 text-center align-middle"
                                                    >
                                                        {formatMonth(schedule.inventory_schedule)}
                                                    </td>
                                                    <td
                                                        className="border px-2 py-1 text-center align-middle"
                                                    >
                                                        {formatDateLong(schedule.actual_date_of_inventory)}
                                                    </td>
                                                    
                                                    {/* {s.subAreaSpan > 0 && (
                                                        <td
                                                            rowSpan={s.subAreaSpan}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            {row.sub_area ?? '—'}
                                                        </td>
                                                    )} */}

                                                    {/* <td className="border px-2 py-1 text-center"> */}
                                                        {/* <StatusPill status={row.status} /> */}
                                                        {/* {formatEnums(row.status)} */}
                                                    {/* </td> */}

                                                    <td
                                                        className="border px-2 py-1 text-center align-middle text-blue-600 underline cursor-pointer"
                                                        onClick={() => {
                                                            setRowAssets({
                                                                scheduleId: schedule.id,
                                                                rowId: row.sub_area_id
                                                                    ? row.sub_area_id
                                                                    : row.building_room_id!,
                                                                type: row.sub_area_id ? 'sub_area' : 'building_room',
                                                                title: `${row.unit ?? ''} / ${row.building ?? ''} / ${
                                                                    row.room ?? ''
                                                                } / ${row.sub_area ?? ''}`,
                                                                unitId: row.unit_id,
                                                            });
                                                        }}
                                                    >
                                                        {formatEnums(row.status)}
                                                    </td>

                                                    {/* <td
                                                        className="border px-2 py-1 text-center align-middle text-blue-600 underline cursor-pointer"
                                                        onClick={() => {
                                                            setRowAssets({
                                                            scheduleId: schedule.id,
                                                            rowId: row.sub_area_id
                                                                ? row.sub_area_id
                                                                : row.building_room_id!,
                                                            type: row.sub_area_id ? 'sub_area' : 'building_room',
                                                            title: `${row.unit ?? ''} / ${row.building ?? ''} / ${
                                                                row.room ?? ''
                                                            } / ${row.sub_area ?? ''}`,
                                                            unitId: row.unit_id,
                                                            });
                                                        }}
                                                    >
                                                        {row.assetCount ?? '—'}
                                                    </td> */}
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
                                    )}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between p-3">
                                <PageInfo
                                    page={page}
                                    total={total}
                                    pageSize={PAGE_SIZE}
                                    label="rows"
                                />
                                <Pagination
                                    page={page}
                                    total={total}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setPage}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signatories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 mt-5 text-xs sm:text-sm">
                        <div className="text-center">
                            <p className="font-semibold mb-6 sm:mb-8">Prepared By:</p>
                            <div className="border-t border-black w-32 sm:w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.prepared_by?.name ?? '—'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 italic">
                                {schedule.prepared_by?.role_name ?? 'Property Clerk'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-6 sm:mb-8">Approved By:</p>
                            <div className="border-t border-black w-32 sm:w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some((s) => s.code === 'approved_by' && s.status === 'approved')
                                    ? signatories['approved_by']?.name
                                    : '—'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 italic">
                                {signatories['approved_by']?.title ?? 'VP for Administration'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-6 sm:mb-8">Received By:</p>
                            <div className="border-t border-black w-32 sm:w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {signatories['received_by']?.name ?? '—'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 italic">
                                {signatories['received_by']?.title ?? 'Internal Auditor'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold mb-6 sm:mb-8">Noted By:</p>
                            <div className="border-t border-black w-32 sm:w-48 mx-auto mb-1"></div>
                            <p className="font-bold text-gray-700 uppercase">
                                {schedule.approvals?.flatMap((a) => a.steps).some((s) => s.code === 'noted_by' && s.status === 'approved')
                                    ? signatories['noted_by']?.name
                                    : '—'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 italic">
                                {signatories['noted_by']?.title ?? 'Head, Property Management'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 print:hidden">
                        <DialogClose asChild>
                            <Button 
                                variant="primary" 
                                className="w-full sm:w-auto cursor-pointer text-xs font-bold sm:text-sm px-3 py-2"
                            >
                                ← Back to Schedules
                            </Button>
                        </DialogClose>
                        {String(schedule.scheduling_status ?? '').toLowerCase() !== 'pending_review' && (
                            <Button
                                onClick={() => window.open(`/inventory-scheduling/${schedule.id}/export-pdf`, '_blank')}
                                className="
                                    w-full sm:w-auto cursor-pointer
                                    inline-block bg-blue-600 text-white 
                                    rounded shadow font-semibold
                                    text-xs sm:text-sm px-3 py-2
                                    hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50
                                "
                            >
                                🖨️ Print Form
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
            {rowAssets && (
                <ViewRowAssetModal
                    open={true}
                    onClose={() => {
                        setRowAssets(null);
                        refreshSchedule();
                    }}
                    scheduleId={rowAssets.scheduleId}
                    rowId={rowAssets.rowId}
                    type={rowAssets.type}
                    title={rowAssets.title}
                    unitId={rowAssets.unitId}
                />
            )}
        </Dialog>
    );
};
