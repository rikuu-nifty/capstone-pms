import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { UnitOrDepartment } from '@/types/unit-or-department';

type Props = {
  onApply: (filters: TurnoverDisposalFilters) => void;
  onClear: () => void;

  selected_status: string;
  selected_type: string;
  selected_issuing_office: string;

  unitOrDepartments: UnitOrDepartment[];
  statusOptions?: string[];
  typeOptions?: string[];
};

export type TurnoverDisposalFilters = {
  status: string;
  type: string;
  issuing_office_id: string;
};

const DEFAULT_STATUS = ['pending_review', 'approved', 'rejected', 'cancelled', 'completed'];
const DEFAULT_TYPES = ['turnover', 'disposal'];

function formatLabel(v: string): string {
  return v.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export default function TurnoverDisposalFilterDropdown({
  onApply,
  onClear,
  selected_status,
  selected_type,
  selected_issuing_office,
  unitOrDepartments,
  statusOptions = DEFAULT_STATUS,
  typeOptions = DEFAULT_TYPES,
}: Props) {
  const [localStatus, setLocalStatus] = useState(selected_status);
  const [localType, setLocalType] = useState(selected_type);
  const [localIssuing, setLocalIssuing] = useState(selected_issuing_office);

  useEffect(() => {
    setLocalStatus(selected_status);
    setLocalType(selected_type);
    setLocalIssuing(selected_issuing_office);
  }, [selected_status, selected_type, selected_issuing_office]);

  const hasAny = !!selected_status || !!selected_type || !!selected_issuing_office;

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Filter className="mr-1 h-4 w-4" /> Filter
          {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-3 w-110 max-h-100 overflow-y-auto z-100">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs font-medium">Status</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
            >
              <option value="">All</option>
              {statusOptions.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-medium">Type</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localType}
              onChange={(e) => setLocalType(e.target.value)}
            >
              <option value="">All</option>
              {typeOptions.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-medium">Issuing Office</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localIssuing}
              onChange={(e) => setLocalIssuing(e.target.value)}
            >
              <option value="">All</option>
              {unitOrDepartments.map(o => (
                <option key={o.code} value={o.code}>{o.code} - {o.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setLocalStatus('');
                setLocalType('');
                setLocalIssuing('');
                onClear();
              }}
              className="cursor-pointer"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApply({
                status: localStatus,
                type: localType,
                issuing_office_id: localIssuing,
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