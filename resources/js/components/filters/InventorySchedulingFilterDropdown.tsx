import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

type SchedulingFilters = {
    status: string;
    inventory_month: string;
    actual_date: string;
};

type Props = {
    onApply: (filters: SchedulingFilters) => void;
    onClear: () => void;

    selected_status: string;
    selected_inventory_month: string;
    selected_actual_date: string;

    statusOptions?: string[];
};

const DEFAULT_STATUS = ['Pending_Review', 'Pending', 'Overdue', 'Completed', 'Cancelled'];

function formatStatusLabel(status: string): string {
    return status
        .split('_')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

export default function InventorySchedulingFilterDropdown({
    onApply,
    onClear,
    selected_status,
    selected_inventory_month,
    selected_actual_date,
    statusOptions = DEFAULT_STATUS,
}: Props) {
    const [localStatus, setLocalStatus] = useState(selected_status);
    const [localMonth, setLocalMonth] = useState(selected_inventory_month);
    const [localActualDate, setLocalActualDate] = useState(selected_actual_date);

    useEffect(() => {
        setLocalStatus(selected_status);
        setLocalMonth(selected_inventory_month);
        setLocalActualDate(selected_actual_date);
    }, [selected_status, selected_inventory_month, selected_actual_date]);

    const hasAny = !!localStatus || !!localMonth || !!localActualDate;
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
            <Filter className="mr-1 h-4 w-4" /> Filter
            {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="p-3 w-[320px] max-h-[400px] overflow-y-auto z-100">
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

            {/* Inventory Month */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Inventory Month</label>
                <input
                    type="month"
                    className="border rounded-md p-2 text-sm"
                    value={localMonth}
                    onChange={(e) => setLocalMonth(e.target.value)}
                />
            </div>

            {/* Actual Date */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Actual Date</label>
                <input
                type="date"
                className="border rounded-md p-2 text-sm"
                value={localActualDate}
                onChange={(e) => setLocalActualDate(e.target.value)}
                />
            </div>

            <div className="flex gap-2 justify-end pt-1">
                <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    setLocalStatus('');
                    setLocalMonth('');
                    setLocalActualDate('');
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
                    inventory_month: localMonth,
                    actual_date: localActualDate,
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
