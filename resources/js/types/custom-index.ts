export type { Building } from './building';
export type { BuildingRoom } from './building-room';
export type { UnitOrDepartment } from './unit-or-department';
export type { Category } from './category';
export type { User } from './user';
export type { InventoryList } from './inventory-list';
export type { Transfer } from './transfer';
export type { TransferFormData } from './transfer';
export type { AssetModel } from './asset-model';
export type { TurnoverDisposals } from './turnover-disposal';
export type { TurnoverDisposalAssets } from './turnover-disposal-assets';
export type { AssetAssignment } from './asset-assignment';
export * from './page-props';

export const formatDate = (dateStr?: string) =>
    !dateStr ? '' : new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatDateLong = (d?: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatStatusLabel = (status: string) =>
    status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

export function formatLabel(v: string): string {
    return v.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
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

export const statusVariantMap: Record<string,'default'|'primary'|'secondary'|'success'|'destructive'> = {
    upcoming: 'secondary',
    in_progress: 'success',
    overdue: 'destructive',
    completed: 'primary',
};