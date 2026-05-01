import MetricKpiCard from '@/components/statistics/MetricKpiCard';
import { formatNumber } from '@/types/custom-index';
import { Boxes, Building2, DoorOpen } from 'lucide-react';

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
            <MetricKpiCard
                icon={Building2}
                label="Total Buildings"
                value={formatNumber(totals.total_buildings)}
                detail="Registered buildings"
                tone="orange"
            />
            <MetricKpiCard
                icon={Boxes}
                label="Avg Assets / Building"
                value={totals.avg_assets_per_building !== undefined ? formatNumber(Number(totals.avg_assets_per_building.toFixed(2))) : '0.00'}
                detail="Average asset density"
                tone="teal"
            />
            <MetricKpiCard icon={DoorOpen} label="Total Rooms" value={formatNumber(totals.total_rooms)} detail="Registered rooms" tone="sky" />
            <MetricKpiCard
                icon={Boxes}
                label="Avg Assets / Room"
                value={totals.avg_assets_per_room !== undefined ? formatNumber(Number(totals.avg_assets_per_room.toFixed(2))) : '0.00'}
                detail="Average room asset count"
                tone="teal"
            />
        </div>
    );
}
