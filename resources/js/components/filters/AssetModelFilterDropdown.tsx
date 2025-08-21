import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { StatusOption, AssetModelFilters } from '@/types/asset-model';
// import { formatStatusLabel } from '@/types/custom-index';

type DropdownProps = {
    onApply: (filters: AssetModelFilters) => void;
    onClear: () => void;
    selected_category_id: number | '';
    selected_status: StatusOption;
    categories: { id: number; name: string }[];

    selected_brand?: string;
    selected_model?: string;
};

function parseStatus(v: string): StatusOption {
        return v === 'active' ? 'active'
            : v === 'is_archived' ? 'is_archived'
            : '';
    }

// const DEFAULT_STATUS = ['active', 'is_archived'];

export default function AssetModelFilterDropdown({
    onApply,
    onClear,
    selected_category_id,
    selected_status,
    categories,
    selected_brand = '',
    selected_model = '',
}: DropdownProps) {

    const [open, setOpen] = useState(false);
    const [localCategoryId, setLocalCategoryId] = useState<number | ''>(selected_category_id);
    const [localStatus, setLocalStatus] = useState<StatusOption>(selected_status);
    const [localBrand, setLocalBrand] = useState<string>(selected_brand ?? '');
    const [localModel, setLocalModel] = useState<string>(selected_model ?? '');

    useEffect(() => {
        setLocalCategoryId(selected_category_id);
        setLocalStatus(selected_status);
        setLocalBrand(selected_brand);
        setLocalModel(selected_model);
    }, [
        selected_category_id, 
        selected_status,
        selected_brand,
        selected_model
    ]);

    const hasAny = 
        localCategoryId !== '' || 
        !!localStatus ||
        localBrand.trim().length > 0 ||
        localModel.trim().length > 0
    ;

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
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localCategoryId === '' ? '' : String(localCategoryId)}
                            onChange={(e) => setLocalCategoryId(e.target.value ? Number(e.target.value) : '')}
                        >
                        <option value="">All</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        </select>
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
                                status: localStatus, // StatusOption -> string OK
                                brand: localBrand,
                                model: localModel,
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
