import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type SortKey = 'id' | 'scheduled_date' | 'asset_count';
export type SortDir = 'asc' | 'desc';

type Props = {
    sortKey: SortKey;
    sortDir: SortDir;
    onChange: (key: SortKey, dir: SortDir) => void;
};

const LABELS: Record<SortKey, string> = {
    id: 'Record ID',
    scheduled_date: 'Scheduled Date',
    asset_count: 'Asset Count',
};

export default function TransferSortDropdown({ sortKey, sortDir, onChange }: Props) {
    const [localKey, setLocalKey] = useState<SortKey>(sortKey);
    const [localDir, setLocalDir] = useState<SortDir>(sortDir);

    useEffect(() => {
        setLocalKey(sortKey);
        setLocalDir(sortDir);
    }, [sortKey, sortDir]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="cursor-pointer w-[260px] justify-between"
                >
                    Sort: {LABELS[sortKey]} ({sortDir === 'asc' ? 'Asc' : 'Desc'})
                    <ChevronDown className="ml-1 h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 w-64">
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Field</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value as SortKey)}
                        >
                            <option value="id">Record ID</option>
                            <option value="scheduled_date">Scheduled Date</option>
                            <option value="asset_count">Asset Count</option>
                        </select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Direction</label>
                        <select
                            className="border rounded-md p-2 text-sm cursor-pointer"
                            value={localDir}
                            onChange={(e) => setLocalDir(e.target.value as SortDir)}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setLocalKey('id');
                                setLocalDir('desc');
                                onChange('id', 'desc');
                            }}
                            className="cursor-pointer"
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onChange(
                                localKey,
                                localDir
                            )}
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
