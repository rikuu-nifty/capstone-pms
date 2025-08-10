import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type SortDir = 'asc' | 'desc';

type SortOption<T extends string> = {
    value: T;
    label: string;
};

type Props<T extends string> = {
    sortKey: T;
    sortDir: SortDir;
    options: SortOption<T>[]; // dynamic fields instead of hardcoded LABELS
    onChange: (key: T, dir: SortDir) => void;
};

export default function SortDropdown<T extends string>({
    sortKey,
    sortDir,
    options,
    onChange,
}: Props<T>) {
  
    const [localKey, setLocalKey] = useState<T>(sortKey);
    const [localDir, setLocalDir] = useState<SortDir>(sortDir);

    useEffect(() => {
        setLocalKey(sortKey);
        setLocalDir(sortDir);
    }, [sortKey, sortDir]);

    const getLabel = (key: T) => options.find((opt) => opt.value === key)?.label ?? key;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="cursor-pointer w-[260px] justify-between"
                >
                Sort: {getLabel(sortKey)} ({sortDir === 'asc' ? 'Asc' : 'Desc'})
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
                            onChange={(e) => setLocalKey(e.target.value as T)}
                        >
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                {opt.label}
                                </option>
                            ))}
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
                                const defaultKey = options[0]?.value ?? ('' as T);
                                setLocalKey(defaultKey);
                                setLocalDir('desc');
                                onChange(defaultKey, 'desc');
                            }}
                            className="cursor-pointer"
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onChange(localKey, localDir)}
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
