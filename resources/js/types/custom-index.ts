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
export * from './page-props';

export const formatDate = (dateStr?: string) =>
    !dateStr ? '' : new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatStatusLabel = (status: string) =>
     status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

export const statusVariantMap: Record<string,'default'|'primary'|'secondary'|'success'|'destructive'> = {
    upcoming: 'secondary',
    in_progress: 'success',
    overdue: 'destructive',
    completed: 'primary',
};