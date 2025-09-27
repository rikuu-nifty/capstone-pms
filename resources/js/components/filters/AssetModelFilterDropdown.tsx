import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { StatusOption, AssetModelFilters } from '@/types/asset-model';
import Select from 'react-select';

type DropdownProps = {
    onApply: (filters: AssetModelFilters) => void;
    onClear: () => void;
    selected_category_id: number | '';
    selected_status: StatusOption;
    categories: { id: number; name: string }[];
    equipment_codes: { id: number; code: string; description?: string | null; category_id: number }[];

    selected_brand?: string;
    selected_model?: string;
    selected_equipment_code_id?: number | '';
};

function parseStatus(v: string): StatusOption {
    return v === 'active' ? 'active'
        : v === 'is_archived' ? 'is_archived'
        : '';
}

export default function AssetModelFilterDropdown({
    onApply,
    onClear,
    selected_category_id,
    selected_status,
    categories,
    selected_brand = '',
    selected_model = '',
    equipment_codes,
    selected_equipment_code_id = '',
}: DropdownProps) {

    const [open, setOpen] = useState(false);
    const [localCategoryId, setLocalCategoryId] = useState<number | ''>(selected_category_id);
    const [localStatus, setLocalStatus] = useState<StatusOption>(selected_status);
    const [localBrand, setLocalBrand] = useState<string>(selected_brand ?? '');
    const [localModel, setLocalModel] = useState<string>(selected_model ?? '');
    const [localEquipmentCodeId, setLocalEquipmentCodeId] = useState<number | ''>(
        selected_equipment_code_id ?? ''
    );

    useEffect(() => {
        setLocalCategoryId(selected_category_id);
        setLocalStatus(selected_status);
        setLocalBrand(selected_brand);
        setLocalModel(selected_model);
        setLocalEquipmentCodeId(selected_equipment_code_id ?? '');
    }, [
        selected_category_id, 
        selected_status,
        selected_brand,
        selected_model,
        selected_equipment_code_id,
    ]);

    // Filter equipment codes based on the selected category
    const filteredEquipmentCodes = useMemo(() => {
        if (!localCategoryId) return equipment_codes;
        return equipment_codes.filter(ec => ec.category_id === Number(localCategoryId));
    }, [equipment_codes, localCategoryId]);

    const hasAny = 
        localCategoryId !== '' || 
        !!localStatus ||
        localBrand.trim().length > 0 ||
        localModel.trim().length > 0 ||
        localEquipmentCodeId !== '';

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
                    {/* Category */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Category</label>
                        <Select
                            className="text-sm"
                            value={
                                localCategoryId
                                    ? { value: localCategoryId, label: categories.find(c => c.id === localCategoryId)?.name ?? '' }
                                    : null
                            }
                            onChange={(opt) => {
                                setLocalCategoryId(opt ? Number(opt.value) : '');
                                setLocalEquipmentCodeId(''); // reset equipment code when category changes
                            }}
                            options={categories.map(c => ({
                                value: c.id,
                                label: c.name,
                            }))}
                            isClearable
                            placeholder="All"
                        />
                    </div>

                    {/* Status */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Model Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(parseStatus(e.target.value))}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="is_archived">Archived</option>
                        </select>
                    </div>

                    {/* Equipment Code */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Equipment Code</label>
                        <Select
                            className="text-sm"
                            value={
                                localEquipmentCodeId
                                    ? { 
                                        value: localEquipmentCodeId, 
                                        label: filteredEquipmentCodes.find(ec => ec.id === localEquipmentCodeId)
                                            ? `${filteredEquipmentCodes.find(ec => ec.id === localEquipmentCodeId)?.code}${filteredEquipmentCodes.find(ec => ec.id === localEquipmentCodeId)?.description ? ` - ${filteredEquipmentCodes.find(ec => ec.id === localEquipmentCodeId)?.description}` : ''}`
                                            : ''
                                    }
                                    : null
                            }
                            onChange={(opt) => setLocalEquipmentCodeId(opt ? Number(opt.value) : '')}
                            options={filteredEquipmentCodes.map(ec => ({
                                value: ec.id,
                                label: `${ec.code}${ec.description ? ` - ${ec.description}` : ''}`,
                            }))}
                            isClearable
                            placeholder={localCategoryId ? "All" : "Select a category first"}
                            isDisabled={!localCategoryId}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: !localCategoryId ? '#f9fafb' : base.backgroundColor,
                                    color: !localCategoryId ? '#9ca3af' : base.color,
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: !localCategoryId ? '#9ca3af' : base.color,
                                }),
                            }}
                        />
                    </div>

                    {/* Brand contains */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Brand (contains)</label>
                        <input
                            type="text"
                            className="border rounded-md p-2 text-sm"
                            placeholder="e.g., HP, Epson"
                            value={localBrand}
                            onChange={(e) => setLocalBrand(e.target.value)}
                        />
                    </div>

                    {/* Model contains */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Model (contains)</label>
                        <input
                            type="text"
                            className="border rounded-md p-2 text-sm"
                            placeholder="e.g., L3150, T480"
                            value={localModel}
                            onChange={(e) => setLocalModel(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalCategoryId('');
                                setLocalStatus('');
                                setLocalBrand('');
                                setLocalModel('');
                                setLocalEquipmentCodeId('');
                                onClear();
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApply({
                                category_id: localCategoryId,
                                status: localStatus,
                                brand: localBrand,
                                model: localModel,
                                equipment_code_id: localEquipmentCodeId,
                            })}
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
