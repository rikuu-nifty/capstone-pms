import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { Category, UnitOrDepartment } from '@/types/custom-index';

type Props = {
    onApply: (filters: {
        categoryId: number | '';
        unitId: number | '';
        status: string;
    }) => void;
    onClear: () => void;

    categories: Category[];
    units: UnitOrDepartment[];

    selectedCategoryId: number | '';
    selectedUnitId: number | '';
    selectedStatus: string;

    canViewAll: boolean;
};

export default function AssetFilterDropdown({
    onApply,
    onClear,
    categories,
    units,
    selectedCategoryId,
    selectedUnitId,
    selectedStatus,
    canViewAll,
}: Props) {
    const [open, setOpen] = useState(false);

    const [localCategory, setLocalCategory] = useState<number | ''>(selectedCategoryId);
    const [localUnit, setLocalUnit] = useState<number | ''>(selectedUnitId);
    const [localStatus, setLocalStatus] = useState<string>(selectedStatus);

    useEffect(() => {
        setLocalCategory(selectedCategoryId);
        setLocalUnit(selectedUnitId);
        setLocalStatus(selectedStatus);
    }, [selectedCategoryId, selectedUnitId, selectedStatus]);

    const hasAny = localCategory !== '' || localUnit !== '' || localStatus !== '';

    // ✅ Build options for react-select
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const unitOptions = units.map(u => ({ value: u.id, label: u.name }));

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-3 w-[360px]">
                <div className="grid gap-3">
                    {/* Category (searchable select) */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Category</label>
                        <Select
                            options={categoryOptions}
                            isClearable
                            value={categoryOptions.find(o => o.value === localCategory) || null}
                            onChange={(option) => setLocalCategory(option ? option.value : '')}
                            placeholder="Filter Search by Categories"
                            className="text-sm"
                        />
                    </div>

                    {/* Unit/Department (searchable select) */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Unit/Department</label>
                        <Select
                            options={unitOptions}
                            isClearable
                            value={unitOptions.find(o => o.value === localUnit) || null}
                            onChange={(option) => setLocalUnit(option ? option.value : '')}
                            placeholder="Filter Search by Unit/Dept/Lab"
                            className="text-sm"
                            isDisabled={!canViewAll} 
                        />
                    </div>

                    {/* Status (simple select) */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalCategory('');
                                setLocalUnit('');
                                setLocalStatus('');
                                onClear();
                                setOpen(false);
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                onApply({
                                    categoryId: localCategory,
                                    unitId: localUnit,
                                    status: localStatus,
                                });
                                setOpen(false);
                            }}
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
