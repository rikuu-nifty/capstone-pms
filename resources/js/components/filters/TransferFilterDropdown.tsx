import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { TransferFilters } from '@/types/page-props';
import { Building } from '@/types/building';
import { UnitOrDepartment } from '@/types/unit-or-department';

type Props = {
    onApply: (filters: TransferFilters) => void;
    onClear: () => void;

    selected_status: string;
    selected_building: string;
    selected_receiving_building: string;
    selected_org: string;

    buildings: Building[];  
    unitOrDepartments: UnitOrDepartment[];
    statusOptions?: string[];
};

const DEFAULT_STATUS = ['upcoming', 'in_progress', 'overdue', 'completed'];

function formatStatusLabel(status: string): string {
    return status
        .split('_')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

export default function TransferFilterDropdown({
    onApply,
    onClear,
    selected_status,
    selected_building,
    selected_receiving_building,
    selected_org,
    buildings,
    unitOrDepartments,
    statusOptions = DEFAULT_STATUS,
}: Props) {
    const [localStatus, setLocalStatus] = useState(selected_status);
    const [localBuilding, setLocalBuilding] = useState(selected_building);
    const [localReceivingBuilding, setLocalReceivingBuilding] = useState(selected_receiving_building);
    const [localOrg, setLocalOrg] = useState(selected_org);

    useEffect(() => {
            setLocalStatus(selected_status);
            setLocalBuilding(selected_building);
            setLocalReceivingBuilding(selected_receiving_building);
            setLocalOrg(selected_org);
    }, [selected_status, selected_building, selected_receiving_building, selected_org]);

    const hasAny =
        !!selected_status || !!selected_building || !!selected_receiving_building || !!selected_org;

    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline"
                    className="cursor-pointer"
                >
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            {/* <DropdownMenuContent className="p-3 w-80"> */}
            <DropdownMenuContent
                className="p-3 w-110 max-h-100 overflow-y-auto z-100"
            >
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>{formatStatusLabel(s)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Current Building</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localBuilding}
                            onChange={(e) => setLocalBuilding(e.target.value)}
                        >
                            <option value="">All</option>
                            {buildings.map((b) => (
                            <option key={b.code} value={b.code}>
                                {b.code} - {b.name} 
                            </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Receiving Building</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localReceivingBuilding}
                            onChange={(e) => setLocalReceivingBuilding(e.target.value)}
                        >
                            <option value="">All</option>
                            {buildings.map((b) => (
                                <option key={b.code} value={b.code}>
                                    {b.code} - {b.name} 
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Unit/Dept/Lab</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localOrg}
                            onChange={(e) => setLocalOrg(e.target.value)}
                        >
                            <option value="">All</option>
                            {unitOrDepartments.map((o) => (
                            <option key={o.code} value={o.code}>
                                {o.code} - {o.name} 
                            </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalStatus('');
                                setLocalBuilding('');
                                setLocalReceivingBuilding('');
                                setLocalOrg('');

                                onClear();
                                // setOpen(false);
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                onApply({
                                    status: localStatus,
                                    building: localBuilding,
                                    receiving_building: localReceivingBuilding,
                                    org: localOrg,
                                })
                            }
                            className="cursor-pointer"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
