import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import { PlusCircle } from 'lucide-react';
import { buildingSortOptions, type BuildingSortKey } from './building-index.helpers';

type Props = {
    search: string;
    onSearchChange: (v: string) => void;
    sortKey: BuildingSortKey;
    sortDir: SortDir;
    onSortChange: (key: BuildingSortKey, dir: SortDir) => void;
    onAdd: () => void;
};

export default function BuildingToolbar({
    search, onSearchChange,
    sortKey, sortDir, onSortChange,
    onAdd,
}: Props) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-96">
                <Input
                  type="text"
                  placeholder="Search by id, code, name, or description..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="max-w-xs"
                />
            </div>

            <div className="flex gap-2">
                <SortDropdown<BuildingSortKey>
                    sortKey={sortKey}
                    sortDir={sortDir}
                    options={buildingSortOptions}
                    onChange={onSortChange}
                />
                <Button onClick={onAdd} className="cursor-pointer">
                    <PlusCircle className="mr-1 h-4 w-4" /> Add New Building
                </Button>
            </div>
        </div>
    );
}
