import { Transfer } from './transfer';
import { InventoryList } from './inventory-list';
import { Building } from './building';
import { BuildingRoom } from './building-room';
import { UnitOrDepartment } from './unit-or-department';
import { User } from './user';

export type TransferPageProps = {
    transfers: Transfer[];
    assets: InventoryList[];
    buildings: Building[];
    buildingRooms: BuildingRoom[];
    unitOrDepartments: UnitOrDepartment[];
    users: User[];

    currentUser: User;

    flash?: {
        success?: string;
        error?: string;
    };
}

export type TransferViewPageProps = {
    transfer: Transfer;
    assets: InventoryList[];
};
