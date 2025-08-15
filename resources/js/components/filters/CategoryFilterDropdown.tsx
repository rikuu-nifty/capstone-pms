import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { CategoryFilters } from '@/types/category';
import { formatStatusLabel } from '@/types/custom-index';

type CategoryFilterProps = {
    onApply: (filters: CategoryFilters) => void;
    onClear: () => void;
    selected_status: string;
    // statusOptions?: Array<'' | 'active' | 'is_archived'>;
    statusOptions?: string[];
};

const DEFAULT_STATUS = ['active', 'is_archived'];

export default function CategoryFilterDropdown({
    onApply,
    onClear,
    selected_status,
    statusOptions = DEFAULT_STATUS,
}: CategoryFilterProps) {

    const [open, setOpen] = useState(false);
    const [localStatus, setLocalStatus] = useState(selected_status);

    useEffect(() => {
        setLocalStatus(selected_status);
    }, [selected_status]);

    const hasAny = !!selected_status;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && (
                        <Badge className="ml-2" variant="secondary">
                            Status: {formatStatusLabel(selected_status)}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-3 w-[320px]">
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Model Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            {statusOptions.map(s => <option key={s} value={s}>{formatStatusLabel(s)}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalStatus('');
                                onClear();
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApply({ 
                                status: localStatus 
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
