import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { UnitOrDepartment } from '@/types/unit-or-department';
import type { TurnoverFilterProps } from '@/types/page-props';

const STATUS_OPTIONS = ['pending_review', 'approved', 'rejected', 'cancelled', 'completed'] as const;
const TYPE_OPTIONS = ['turnover', 'disposal'] as const;

function formatLabel(v: string) {
  return v.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
}

export default function TurnoverFilterDropdown({
  onApply,
  onClear,
  selected_status,
  selected_type,
  selected_issuing_office,
  selected_receiving_office,
  unitOrDepartments,
}: TurnoverFilterProps) {
  const [localStatus, setLocalStatus] = useState(selected_status);
  const [localType, setLocalType] = useState(selected_type);
  const [localIssuing, setLocalIssuing] = useState(selected_issuing_office);
  const [localReceiving, setLocalReceiving] = useState(selected_receiving_office);

  useEffect(() => {
    setLocalStatus(selected_status);
    setLocalType(selected_type);
    setLocalIssuing(selected_issuing_office);
    setLocalReceiving(selected_receiving_office);
  }, [selected_status, selected_type, selected_issuing_office, selected_receiving_office]);

  const hasAny = !!(selected_status || selected_type || selected_issuing_office || selected_receiving_office);

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Filter className="mr-1 h-4 w-4" /> Filter
          {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-3 w-96 max-h-100 overflow-y-auto z-100">
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
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{formatLabel(s)}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="grid gap-1">
            <label className="text-xs font-medium">Type</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localType}
              onChange={(e) => setLocalType(e.target.value)}
            >
              <option value="">All</option>
              {TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{formatLabel(t)}</option>
              ))}
            </select>
          </div>

          {/* Issuing Office */}
          <div className="grid gap-1">
            <label className="text-xs font-medium">Issuing Office</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localIssuing}
              onChange={(e) => setLocalIssuing(e.target.value)}
            >
              <option value="">All</option>
              {unitOrDepartments.map(o => (
                <option key={o.id} value={String(o.id)}>
                  {o.code} - {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Receiving Office */}
          <div className="grid gap-1">
            <label className="text-xs font-medium">Receiving Office</label>
            <select
              className="border rounded-md p-2 text-sm cursor-pointer"
              value={localReceiving}
              onChange={(e) => setLocalReceiving(e.target.value)}
            >
              <option value="">All</option>
              {unitOrDepartments.map(o => (
                <option key={o.id} value={String(o.id)}>
                  {o.code} - {o.name}
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
                setLocalType('');
                setLocalIssuing('');
                setLocalReceiving('');
                onClear();
              }}
              className="cursor-pointer"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApply({
                  status: localStatus,
                  type: localType,
                  issuing_office: localIssuing,
                  receiving_office: localReceiving,
                });
                setOpen(false);
              }}
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