import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import Select from 'react-select';

type OffCampusFilters = {
    status: string;
    college_unit: string;
    date_issued: string;
    return_date: string;
};

type UnitOrDepartmentLite = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    onApply: (filters: OffCampusFilters) => void;
    onClear: () => void;

    selected_status: string;
    selected_college_unit: string;
    selected_date_issued: string;
    selected_return_date: string;

    unitOrDepartments: UnitOrDepartmentLite[];
    statusOptions?: string[];
};

const DEFAULT_STATUS = ['pending_review', 'pending_return', 'returned', 'overdue', 'cancelled'];

export default function OffCampusFilterDropdown({
    onApply,
    onClear,
    selected_status,
    selected_college_unit,
    selected_date_issued,
    selected_return_date,
    unitOrDepartments,
    statusOptions = DEFAULT_STATUS,
}: Props) {
    const [localStatus, setLocalStatus] = useState(selected_status);
    const [localCollege, setLocalCollege] = useState(selected_college_unit);
    const [localIssued, setLocalIssued] = useState(selected_date_issued);
    const [localReturn, setLocalReturn] = useState(selected_return_date);

    useEffect(() => {
        setLocalStatus(selected_status);
        setLocalCollege(selected_college_unit);
        setLocalIssued(selected_date_issued);
        setLocalReturn(selected_return_date);
    }, [selected_status, selected_college_unit, selected_date_issued, selected_return_date]);

    const hasAny = !!localStatus || !!localCollege || !!localIssued || !!localReturn;
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
            <Filter className="mr-1 h-4 w-4" /> Filter
            {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="p-3 w-[340px] max-h-[400px] overflow-y-auto z-100">
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
                    {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                ))}
                </select>
            </div>

            {/* College/Unit */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">College/Unit</label>
                <Select
                className="text-sm"
                options={unitOrDepartments.map((u) => ({
                    value: u.code,
                    label: `${u.name}`,
                }))}
                value={localCollege ? { value: localCollege, label: localCollege } : null}
                onChange={(opt) => setLocalCollege(opt ? opt.value : '')}
                isClearable
                placeholder="All"
                />
            </div>

            {/* Date Issued */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Date Issued</label>
                <input
                type="date"
                className="border rounded-md p-2 text-sm"
                value={localIssued}
                onChange={(e) => setLocalIssued(e.target.value)}
                />
            </div>

            {/* Return Date */}
            <div className="grid gap-1">
                <label className="text-xs font-medium">Return Date</label>
                <input
                type="date"
                className="border rounded-md p-2 text-sm"
                value={localReturn}
                onChange={(e) => setLocalReturn(e.target.value)}
                />
            </div>

            {/* Footer */}
            <div className="flex gap-2 justify-end pt-1">
                <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    setLocalStatus('');
                    setLocalCollege('');
                    setLocalIssued('');
                    setLocalReturn('');
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
                    college_unit: localCollege,
                    date_issued: localIssued,
                    return_date: localReturn,
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
