import { Building2, DoorOpen, Boxes } from 'lucide-react';
import { formatNumber } from '@/types/custom-index';

type Props = {
    totals?: {
        total_buildings: number;
        total_rooms: number;
        avg_assets_per_building?: number;
        avg_assets_per_room?: number;
    };
};

export default function BuildingKPISection({ totals }: Props) {
    if (!totals) return null;

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* Total Buildings */}
            <div className="rounded-2xl border p-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Building2 className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Total Buildings</div>
                    <div className="text-3xl font-bold">
                        {formatNumber(totals.total_buildings)}
                    </div>
                </div>
            </div>

            {/* Average Assets per Building */}
            <div className="rounded-2xl border p-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <Boxes className="h-7 w-7 text-teal-600" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Avg Assets / Building</div>
                    <div className="text-3xl font-bold">
                        {totals.avg_assets_per_building !== undefined
                            ? formatNumber(Number(totals.avg_assets_per_building.toFixed(2)))
                            : '0.00'}
                    </div>
                </div>
            </div>

            {/* Total Rooms */}
            <div className="rounded-2xl border p-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
                    <DoorOpen className="h-7 w-7 text-sky-600" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Total Rooms</div>
                    <div className="text-3xl font-bold">
                        {formatNumber(totals.total_rooms)}
                    </div>
                </div>
            </div>

            {/* Average Assets per Room */}
            <div className="rounded-2xl border p-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <Boxes className="h-7 w-7 text-teal-600" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Avg Assets / Room</div>
                    <div className="text-3xl font-bold">
                        {totals.avg_assets_per_room !== undefined
                            ? formatNumber(Number(totals.avg_assets_per_room.toFixed(2)))
                            : '0.00'}
                    </div>
                </div>
            </div>
        </div>
    );
}
