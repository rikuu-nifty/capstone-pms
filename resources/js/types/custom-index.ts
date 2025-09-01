export type { Building } from './building';
export type { BuildingRoom } from './building-room';
export type { UnitOrDepartment } from './unit-or-department';
export type { Category } from './category';
export type { User, UserPageProps, TabKey, QueryParams } from './user';
export type { InventoryList } from './inventory-list';
export type { Transfer } from './transfer';
export type { TransferFormData } from './transfer';
export type { AssetModel } from './asset-model';
export type { TurnoverDisposals } from './turnover-disposal';
export type { TurnoverDisposalAssets } from './turnover-disposal-assets';
export type { AssetAssignment } from './asset-assignment';
export type { Role, RolePageProps } from './role';
export type { UserDetail } from './user-detail';
export type { Permission } from './permission';
export * from './page-props';

export const formatDate = (dateStr?: string) =>
    !dateStr ? '' : new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const date = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return `${date} ${time}`;
};

export const formatStatusLabel = (status: string) =>
    status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

export function formatLabel(v: string): string {
    return v.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export function ucwords(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatUnderscore(status: string): string {
  return status.replace(/_/g, ' ');
}

export const formatEnums = (value?: string) => {
    if (!value) return '';
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2') 
        .replace(/[_-]+/g, ' ')             
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
};

export const statusVariantMap: Record<string,'default'|'primary'|'secondary'|'success'|'destructive'|'outline'|'pending'|'completed'|'overdue'> = {
    pending_review: 'pending',
    upcoming: 'secondary',
    in_progress: 'success',
    overdue: 'overdue',
    completed: 'completed',
    approved: 'success',
    rejected: 'destructive',
    cancelled: 'secondary',
};

export const formatNumber = (n?: number | null) =>
    typeof n === 'number' ? n.toLocaleString() : '—';

export function formatFullName(
    firstName: string,
    middleName: string | null,
    lastName: string
): string {
    if (middleName && middleName.trim().length > 0) {
        const initial = middleName.trim().charAt(0).toUpperCase();
        return `${firstName} ${initial}. ${lastName}`;
    }
    return `${firstName} ${lastName}`;
}

export const formatForInputDate = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};
