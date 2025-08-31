import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { formatStatusLabel } from '@/types/custom-index';

export type UserStatus = '' | 'pending' | 'approved' | 'denied';

type Props = {
    onApply: (status: UserStatus) => void;
    onClear: () => void;
    selected_status: UserStatus;
};

const STATUS_OPTIONS: UserStatus[] = ['pending', 'approved', 'denied'];

export default function UserStatusFilterDropdown({
    onApply,
    onClear,
    selected_status,
}: Props) {

    const [open, setOpen] = useState(false);
    const [localStatus, setLocalStatus] = useState<UserStatus>(selected_status);

    useEffect(() => {
        setLocalStatus(selected_status);
    }, [selected_status]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {localStatus && (
                        <Badge className="ml-2" variant="secondary">
                            {formatStatusLabel(localStatus)}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-3 w-[320px]">
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">User Status</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value as UserStatus)} // ✅ cast
                        >
                            <option value="">All</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                {formatStatusLabel(s)}
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
                                onClear();
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApply(localStatus)}
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
