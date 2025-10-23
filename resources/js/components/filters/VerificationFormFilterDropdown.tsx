import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import Select from 'react-select';

type VerificationFilters = {
    status: string;
    requester: string;
};

type Props = {
    onApply: (filters: VerificationFilters) => void;
    onClear: () => void;
    selected_status: string;
    selected_requester: string;
    requesterOptions?: { id: number; name: string }[];
};

const STATUS_OPTIONS = ['pending', 'verified', 'rejected'];

function formatStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function VerificationFormFilterDropdown({
    onApply,
    onClear,
    selected_status,
    selected_requester,
    requesterOptions = [],
}: Props) {
    const [open, setOpen] = useState(false);
    const [localStatus, setLocalStatus] = useState(selected_status);
    const [localRequester, setLocalRequester] = useState(selected_requester);

    useEffect(() => {
        setLocalStatus(selected_status);
        setLocalRequester(selected_requester);
    }, [selected_status, selected_requester]);

    const hasAny = !!localStatus || !!localRequester;

    const requesterSelectOptions = requesterOptions.map((r) => ({
        value: r.name,
        label: r.name,
    }));

    const selectedRequesterOption =
        requesterSelectOptions.find((opt) => opt.value === localRequester) ?? null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && (
                        <Badge className="ml-2" variant="secondary">
                            Active
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="p-0 w-[360px] h-[250px] overflow-hidden z-100 flex flex-col"
                align="end"
            >
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Status */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {formatStatusLabel(s)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Requester */}
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Requester</label>
                        <Select
                            className="text-sm"
                            classNames={{
                                control: () => 'border rounded-md min-h-[38px] cursor-pointer',
                                menu: () => 'text-sm',
                            }}
                            placeholder="Select requester..."
                            options={requesterSelectOptions}
                            value={selectedRequesterOption}
                            onChange={(opt) => setLocalRequester(opt?.value ?? '')}
                            isClearable
                            isSearchable
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>
                </div>

                {/* Sticky footer buttons */}
                <div className="border-t border-muted bg-background p-3 flex justify-end gap-2 sticky bottom-0">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setLocalStatus('');
                            setLocalRequester('');
                            onClear();
                        }}
                        className="cursor-pointer"
                    >
                        Clear
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onApply({ status: localStatus, requester: localRequester })}
                        className="cursor-pointer"
                    >
                        Apply
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
