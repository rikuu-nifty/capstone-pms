import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import { PlusCircle, Pencil, Eye, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination, { PageInfo } from '@/components/Pagination';
import {
    ROOM_PAGE_SIZE,
    roomSortOptions,
    type RoomSortKey,
    isStringKey,
    roomNumberKey,
    roomStringKey,
} from './building-index.helpers';
import { type Building, } from '@/types/building';
import { type BuildingRoom } from '@/types/custom-index';

type Props = {
    buildings: Building[];
    rooms: BuildingRoom[];
    selectedBuildingId: number | null;
    onClearSelectedBuilding: () => void;
    onAddRoomClick: () => void;
    onEditRoomClick: (room: BuildingRoom) => void;
    onDeleteRoomClick: (room: BuildingRoom) => void;
};

export default function RoomsSection({
    buildings, 
    rooms, 
    selectedBuildingId, 
    onClearSelectedBuilding,
    onAddRoomClick,
    onEditRoomClick,
    onDeleteRoomClick,
}: Props) {
    const [roomSearch, setRoomSearch] = useState('');
    const [roomSortKey, setRoomSortKey] = useState<RoomSortKey>('id');
    const [roomSortDir, setRoomSortDir] = useState<SortDir>('asc');
    const [roomPage, setRoomPage] = useState(1);

    useEffect(() => { setRoomPage(1); }, [roomSearch, roomSortKey, roomSortDir, selectedBuildingId]);

    const selectedBuildingCode = useMemo(() => {
        if (!selectedBuildingId) return null;
        return buildings.find(b => Number(b.id) === Number(selectedBuildingId))?.code ?? null;
    }, [buildings, selectedBuildingId]);

    const roomsFiltered = useMemo(() => {
        let base = rooms;

        if (selectedBuildingId) {
        base = base.filter(r => Number(r.building_id) === Number(selectedBuildingId));
        }

        const q = roomSearch.trim().toLowerCase();
        if (q) {
        base = base.filter(r => {
            const haystack = `${r.id} ${r.room ?? ''} ${r.building?.code ?? ''}`.toLowerCase();
            return haystack.includes(q);
        });
        }

        return base;
    }, [rooms, selectedBuildingId, roomSearch]);

    const roomsSorted = useMemo(() => {
        const dir = roomSortDir === 'asc' ? 1 : -1;
        return [...roomsFiltered].sort((a, b) => {
            if (isStringKey(roomSortKey)) {
                const da = roomStringKey(a, roomSortKey);
                const db = roomStringKey(b, roomSortKey);
                const d = da.localeCompare(db, undefined, { sensitivity: 'base', numeric: true });
                return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
            }
            const d = roomNumberKey(a, roomSortKey) - roomNumberKey(b, roomSortKey);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [roomsFiltered, roomSortKey, roomSortDir]);

    const roomStart = (roomPage - 1) * ROOM_PAGE_SIZE;
    const roomPageItems = roomsSorted.slice(roomStart, roomStart + ROOM_PAGE_SIZE);

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-xl font-semibold">
                    {selectedBuildingId ? (
                    <>Rooms in <span className="text-red-600">{selectedBuildingCode}</span> Building</>
                    ) : ('Building Rooms')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {selectedBuildingId ? 'Filtered to rooms in the selected building.' : 'Showing all rooms across all buildings.'}
                </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Input
                    type="text"
                    placeholder="Search by id, building code, or room..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full sm:w-80 md:w-96"
                />

                <div className="ml-auto flex gap-2">
                    <SortDropdown<RoomSortKey>
                        sortKey={roomSortKey}
                        sortDir={roomSortDir}
                        options={roomSortOptions}
                        onChange={(key, dir) => {
                            setRoomSortKey(key);
                            setRoomSortDir(dir);
                        }}
                        widthClassName="w-[280px]"
                    />

                    {selectedBuildingId !== null && (
                        <Button variant="destructive" onClick={onClearSelectedBuilding} className="cursor-pointer">
                        Clear Building Filter
                        </Button>
                    )}

                    <Button className="cursor-pointer" onClick={onAddRoomClick}>
                        <PlusCircle className="mr-1 h-4 w-4" /> Add New Room
                    </Button>
                </div>
            </div>

            <div className="rounded-lg overflow-x-auto border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted text-foreground">
                        <TableHead className="text-center">Room ID</TableHead>
                        <TableHead className="text-center">Room (Name/Number)</TableHead>
                        <TableHead className="text-center">Building Code</TableHead>
                        <TableHead className="text-center">Description</TableHead>
                        <TableHead className="text-center">Sub Areas Count</TableHead>
                        <TableHead className="text-center">Assets Count</TableHead>
                        <TableHead className="text-center">Institution Asset Share</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-center">
                        {roomPageItems.length > 0 ? roomPageItems.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell>{r.id}</TableCell>
                            <TableCell className="font-medium">{r.room}</TableCell>
                            <TableCell>{r.building?.code ?? '—'}</TableCell>
                            <TableCell className="max-w-[500px] whitespace-normal break-words text-center">
                                {r.description ?? '—'}
                            </TableCell>
                            <TableCell className="font-medium">{r.sub_areas_count ?? 0}</TableCell>
                            <TableCell className="font-medium">{r.assets_count}</TableCell>
                            <TableCell>
                                {/* {(r.assets_count ?? 0).toLocaleString()}{' '} */}
                                {/* <span className="text-muted-foreground">({(r.asset_share ?? 0).toFixed(2)}%)</span> */}
                                {(r.asset_share ?? 0).toFixed(2)}%
                            </TableCell>
                            <TableCell className="h-full">
                                <div className="flex justify-center items-center gap-2 h-full">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer"
                                        onClick={() => 
                                            onEditRoomClick(r)
                                        }
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeleteRoomClick(r)}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>

                                    <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            asChild 
                                            className="cursor-pointer" 
                                            onClick={(e) => 
                                                e.stopPropagation()
                                            }>
                                            <Link 
                                                href={`/buildings/rooms/view/${r.id}`}
                                                preserveScroll
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                            No rooms found.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <PageInfo page={roomPage} total={roomsSorted.length} pageSize={ROOM_PAGE_SIZE} label="rooms" />
                <Pagination page={roomPage} total={roomsSorted.length} pageSize={ROOM_PAGE_SIZE} onPageChange={setRoomPage} />
            </div>
        </div>
    );
}
