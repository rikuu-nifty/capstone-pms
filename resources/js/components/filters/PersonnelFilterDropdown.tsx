import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { UnitLite } from '@/types/personnel';

type Props = {
    units: UnitLite[];
    selectedUnitId: number | '';
    selectedStatus: string;
    onApply: (filters: { unitId: number | ''; status: string }) => void;
    onClear: () => void;
};

export default function PersonnelFilterDropdown({
    units,
    selectedUnitId,
    selectedStatus,
    onApply,
    onClear,
}: Props) {
    const [open, setOpen] = useState(false);

    const [localUnit, setLocalUnit] = useState<number | ''>(selectedUnitId);
    const [localStatus, setLocalStatus] = useState<string>(selectedStatus);

    useEffect(() => {
        setLocalUnit(selectedUnitId);
        setLocalStatus(selectedStatus);
    }, [selectedUnitId, selectedStatus]);

    const hasAny = localUnit !== '' || localStatus !== '';

    const unitOptions = units.map(u => ({ value: u.id, label: u.name }));

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-3 w-[320px]">
                <div className="grid gap-3">
                    {/* Unit filter */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Unit/Department</label>
                        <Select
                            options={unitOptions}
                            isClearable
                            value={unitOptions.find(o => o.value === localUnit) || null}
                            onChange={(opt) => setLocalUnit(opt ? opt.value : '')}
                            placeholder="Filter by Unit/Department"
                            className="text-sm"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="left_university">Left University</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalUnit('');
                                setLocalStatus('');
                                onClear();
                                setOpen(false);
                            }}
                        >
                        Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                onApply({ unitId: localUnit, status: localStatus });
                                setOpen(false);
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
