// building-kpi-section.tsx
import KPIStatCard from '@/components/statistics/KPIStatCard';
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

export default function BuildingKPISection({ 
  totals 
}: Props) {

    if (!totals) return null;

    return (
        <div className="flex flex-wrap justify-between">
            <KPIStatCard
                label="Total Buildings"
                value={formatNumber(totals.total_buildings)}
                icon={Building2}
                barColor="bg-orange-400"
                className="w-[350px] h-[140px]"
            />
            <KPIStatCard
                label="Average Assets per Building"
                value={
                  totals.avg_assets_per_building !== undefined
                    ? formatNumber(Number(totals.avg_assets_per_building.toFixed(2)))
                    : '0.00'
                }
                icon={Boxes}
                barColor="bg-teal-400"
                className="w-[350px] h-[140px]"
            />
            <KPIStatCard
                label="Total Rooms"
                value={formatNumber(totals.total_rooms)}
                icon={DoorOpen}
                barColor="bg-sky-400"
                className="w-[350px] h-[140px]"
            />
            <KPIStatCard
                label="Average Assets per Room"
                value={
                  totals.avg_assets_per_room !== undefined
                    ? formatNumber(Number(totals.avg_assets_per_room.toFixed(2)))
                    : '0.00'
                }
                icon={Boxes}
                barColor="bg-teal-400"
                className="w-[350px] h-[140px]"
            />
        </div>
    );
}
