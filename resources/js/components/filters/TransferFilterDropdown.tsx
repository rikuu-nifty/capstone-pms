import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import Select from 'react-select';
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
            <Button variant="outline" className="cursor-pointer">
            <Filter className="mr-1 h-4 w-4" /> Filter
            {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="p-3 w-[360px] max-h-[400px] overflow-y-auto z-100">
            <div className="grid gap-3">
            {/* Status */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Status</label>
                <select
                className="border rounded-md p-2 text-sm cursor-pointer"
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value)}
                >
                <option value="">All</option>
                {statusOptions.map((s) => (
                    <option key={s} value={s}>
                    {formatStatusLabel(s)}
                    </option>
                ))}
                </select>
            </div>

            {/* Current Building */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Current Building</label>
                <Select
                className="text-sm"
                options={buildings.map((b) => ({
                    value: b.code,
                    label: `${b.code} – ${b.name}`,
                }))}
                value={
                    localBuilding
                    ? { value: localBuilding, label: `${localBuilding}` }
                    : null
                }
                onChange={(opt) => setLocalBuilding(opt ? opt.value : '')}
                isClearable
                placeholder="All"
                />
            </div>

            {/* Receiving Building */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Receiving Building</label>
                <Select
                className="text-sm"
                options={buildings.map((b) => ({
                    value: b.code,
                    label: `${b.code} – ${b.name}`,
                }))}
                value={
                    localReceivingBuilding
                    ? { value: localReceivingBuilding, label: `${localReceivingBuilding}` }
                    : null
                }
                onChange={(opt) => setLocalReceivingBuilding(opt ? opt.value : '')}
                isClearable
                placeholder="All"
                />
            </div>

            {/* Unit/Dept/Lab */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Unit/Dept/Lab</label>
                <Select
                className="text-sm"
                options={unitOrDepartments.map((o) => ({
                    value: o.code,
                    label: `${o.code} – ${o.name}`,
                }))}
                value={localOrg ? { value: localOrg, label: `${localOrg}` } : null}
                onChange={(opt) => setLocalOrg(opt ? opt.value : '')}
                isClearable
                placeholder="All"
                />
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
                }}
                className="cursor-pointer"
                >
                Clear
                </Button>
                <Button
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
