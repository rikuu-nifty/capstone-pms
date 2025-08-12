import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type SortDir = 'asc' | 'desc';

export type SortOption<K extends string = string> = {
  value: K;
  label: string;
};

type Props<K extends string = string> = {
  sortKey: K;
  sortDir: SortDir;
  options: ReadonlyArray<SortOption<K>>;
  onChange: (key: K, dir: SortDir) => void;
  widthClassName?: string; // optional control (defaults to same as transfers)
};

export default function SortDropdown<K extends string>({
  sortKey,
  sortDir,
  options,
  onChange,
  widthClassName = 'w-[260px]',
}: Props<K>) {
  const [localKey, setLocalKey] = useState<K>(sortKey);
  const [localDir, setLocalDir] = useState<SortDir>(sortDir);

  useEffect(() => {
    setLocalKey(sortKey);
    setLocalDir(sortDir);
  }, [sortKey, sortDir]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`cursor-pointer ${widthClassName} justify-between`}>
          Sort: {options.find(o => o.value === sortKey)?.label ?? '—'} ({sortDir === 'asc' ? 'Asc' : 'Desc'})
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
              onChange={(e) => setLocalKey(e.target.value as K)}
            >
              {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
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
                const defKey = options[0]?.value ?? sortKey;
                setLocalKey(defKey);
                setLocalDir('desc');
                onChange(defKey, 'desc');
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