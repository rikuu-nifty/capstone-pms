import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, PlusCircle, Trash2, Building2, DoorOpen, Boxes } from 'lucide-react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import SortDropdown, {type SortDir} from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';

import { Building, PageProps } from '@/types/building';
import { formatNumber, BuildingRoom } from '@/types/custom-index';
import AddBuildingModal from './AddBuildingModal';
import EditBuildingModal from './EditBuildingModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import ViewBuildingModal from './ViewBuildingModal';
import KPIStatCard from '@/components/statistics/KPIStatCard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Buildings',
        href: '/buildings',
    },
];

const buildingSortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'code', label: 'Building Code' },
    { value: 'name', label: 'Name' },
    { value: 'building_rooms_count', label: 'Room Count' },
    { value: 'assets_count', label: 'Assets Count' },
] as const;

const roomSortOptions = [
    { value: 'id', label: 'Room ID' },
    { value: 'building_code', label: 'Building Code' },
    { value: 'room', label: 'Room' },
] as const;

type BuildingSortKey = (typeof buildingSortOptions)[number]['value'];
type RoomSortKey = (typeof roomSortOptions)[number]['value'];

export default function BuildingIndex({ 
    buildings = [],
    totals,
}: PageProps) {

    const { props } = usePage<PageProps>();

    const [rawSearch, setRawSearch] = useState(''); //building
    const search = useDebouncedValue(rawSearch, 200).trim().toLowerCase();

    const [roomSearchRaw, setRoomSearchRaw] = useState(''); //building room
    const roomSearch = useDebouncedValue(roomSearchRaw, 200).trim().toLowerCase();

    const [showAddBuilding, setShowAddBuilding] = useState(false);
    const [showEditBuilding, setShowEditBuilding] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [showViewBuilding, setShowViewBuilding] = useState(false);
    const [viewBuilding, setViewBuilding] = useState<Building | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toDelete, setToDelete] = useState<Building | null>(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

    // const [showAddRoom, setShowAddRoom] = useState(false);

    const [sortKey, setSortKey] = useState<BuildingSortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [roomSortKey, setRoomSortKey] = useState<RoomSortKey>('id');
    const [roomSortDir, setRoomSortDir] = useState<SortDir>('asc');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const [roomPage, setRoomPage] = useState(1);
    const ROOM_PAGE_SIZE = 5;

    const rooms = useMemo(() => props.rooms ?? [], [props.rooms]);

    useEffect(() => {
        if (props.selected) setSelectedBuildingId(Number(props.selected));
    }, [
        props.selected
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        search, 
        sortKey, 
        sortDir
    ]);

    useEffect(() => {
        setRoomPage(1);
    }, [
        roomSearch, 
        roomSortKey, 
        roomSortDir, 
        selectedBuildingId
    ]);

    useEffect(() => {
        if (props.viewing) {
            setViewBuilding(props.viewing);
            setShowViewBuilding(true);
        }
    }, [
        props.viewing
    ]);

    const closeViewBuilding = () => {
        setShowViewBuilding(false);
        setViewBuilding(null);
        if (/^\/?buildings\/view\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    const filtered = useMemo(() => {
        return buildings.filter((b) => {
            const haystack = `${b.id} ${b.name ?? ''} ${b.code ?? ''} ${b.description ?? ''}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            return matchesSearch;
        });
    }, [
        buildings, 
        search
    ]);

    const roomsFiltered = useMemo(() => {
        let base = rooms;

        if (selectedBuildingId) {
            base = base.filter(r => Number(r.building_id) === Number(selectedBuildingId));
        }

        if (roomSearch) {
            const q = roomSearch;
            base = base.filter(r => {
                const haystack = `${r.id} ${r.room ?? ''} ${r.building?.code ?? ''}`.toLowerCase();
                return haystack.includes(q);
            });
        }

        return base;
    }, [
        rooms, 
        selectedBuildingId, 
        roomSearch
    ]);

    const selectedBuildingCode = useMemo(() => {
        if (!selectedBuildingId) return null;
        return buildings.find(b => Number(b.id) === Number(selectedBuildingId))!.code;
    }, [
        buildings, 
        selectedBuildingId
    ]);

    const numberKey = (b: Building, k: BuildingSortKey) =>
        k === 'id' ? Number(b.id) || 0
        : k === 'building_rooms_count' ? Number(b.building_rooms_count) || 0
        : k === 'assets_count' ? b.assets_count
        : 0
    ;

    const roomNumberKey = (r: BuildingRoom, k: RoomSortKey) =>
        k === 'id' ? Number(r.id) || 0 : 0
    ;

    const roomStringKey = (r: BuildingRoom, k: RoomSortKey) =>
        k === 'room' ? (r.room ?? '')
        : k === 'building_code' ? (r.building?.code ?? '')
        : ''
    ;

    const isStringKey = (k: RoomSortKey): k is 'room' | 'building_code' =>
        k === 'room' || k === 'building_code';

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            if (sortKey === 'name' || sortKey === 'code') {
                const da = (a[sortKey] ?? '').toString();
                const db = (b[sortKey] ?? '').toString();
                const d = da.localeCompare(db);
                return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
            }
            const d = numberKey(a, sortKey) - numberKey(b, sortKey);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [
        filtered, 
        sortKey, 
        sortDir
    ]);

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
    }, [
        roomsFiltered, 
        roomSortKey, 
        roomSortDir
    ]);

    const start = (page - 1) * PAGE_SIZE;
    const page_items = sorted.slice(start, start + PAGE_SIZE);
    
    const roomStart = (roomPage - 1) * ROOM_PAGE_SIZE;
    const roomPageItems = roomsSorted.slice(roomStart, roomStart + ROOM_PAGE_SIZE);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buildings" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Buildings</h1>
                        <p className="text-sm text-muted-foreground">List of AUF buildings.</p>
                    </div>

                    {totals && (
                        <div className="flex flex-wrap justify-between">
                            <KPIStatCard
                                label="Total Buildings"
                                value={formatNumber(totals.total_buildings)}
                                icon={Building2}
                                barColor="bg-orange-400"
                                className="w-[350px] h-[140px]"
                            />
                            <KPIStatCard
                                label="Average Assets per Building"
                                value={totals.avg_assets_per_building !== undefined
                                ? formatNumber(Number(totals.avg_assets_per_building.toFixed(2)))
                                : '0.00'}
                                icon={Boxes}
                                barColor="bg-teal-400"
                                className="w-[350px] h-[140px]"
                            />
                            <KPIStatCard
                                label="Total Rooms"
                                value={formatNumber(totals.total_rooms)}
                                icon={DoorOpen}
                                barColor="bg-sky-400"
                                className="w-[350px] h-[140px]"
                            />
                            <KPIStatCard
                                label="Average Assets per Room"
                                value={totals.avg_assets_per_building !== undefined
                                ? formatNumber(Number(totals.avg_assets_per_room.toFixed(2)))
                                : '0.00'}
                                icon={Boxes}
                                barColor="bg-teal-400"
                                className="w-[350px] h-[140px]"
                            />
                        </div>
                     )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 w-96">
                            <Input
                                type="text"
                                placeholder="Search by id, code, name, or description..."
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>

                        <div className="flex gap-2">
                            <SortDropdown<BuildingSortKey>
                                sortKey={sortKey}
                                sortDir={sortDir}
                                options={buildingSortOptions}
                                onChange={(key, dir) => {
                                    setSortKey(key);
                                    setSortDir(dir);
                                }}
                            />

                            <Button
                                onClick={() => setShowAddBuilding(true)}
                                className="cursor-pointer"
                            >
                                <PlusCircle className="mr-1 h-4 w-4" /> Add New Building
                            </Button>
                        </div>
                    </div>
                </div>

                {/* BUILDINGS TABLE */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">ID</TableHead>
                                <TableHead className="text-center">Building Code</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Room Count</TableHead>
                                <TableHead className="text-center">Assets Count</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="text-center">
                            {page_items.length > 0 ? page_items.map((b) => (
                                <TableRow
                                    key={b.id}
                                    onClick={() => setSelectedBuildingId(Number(b.id))}
                                    className={`cursor-pointer ${selectedBuildingId === Number(b.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <TableCell>{b.id}</TableCell>
                                    <TableCell className="font-medium">{b.code}</TableCell>
                                    <TableCell>{b.name}</TableCell>
                                    <TableCell
                                        className={`max-w-[250px] whitespace-normal break-words ${
                                            b.description && b.description !== '-' ? 'text-justify' : 'text-center'
                                        }`}
                                    >
                                        {b.description ?? '—'}
                                    </TableCell>
                                    <TableCell>{b.building_rooms_count ?? 0}</TableCell>
                                    <TableCell>{b.assets_count ?? 0}</TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex justify-center items-center gap-2 h-full">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedBuilding(b);
                                                    setShowEditBuilding(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setToDelete(b);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                asChild 
                                                className="cursor-pointer"
                                            >
                                                <Link 
                                                    href={`/buildings/view/${b.id}`} 
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
                                        No buildings found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <PageInfo page={page} total={sorted.length} pageSize={PAGE_SIZE} label="buildings" />
                    <Pagination page={page} total={sorted.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </div>

                {/* ROOMS SECTION */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                        <h2 className="text-xl font-semibold">
                            {selectedBuildingId ? (
                            <>
                                Rooms in <span className="text-red-600">{selectedBuildingCode}</span> Building
                            </>
                            ) : (
                            'Building Rooms'
                            )}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {selectedBuildingId
                            ? 'Filtered to rooms in the selected building.'
                            : 'Showing all rooms across all buildings.'}
                        </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search by id, building code, or room..."
                            value={roomSearchRaw}
                            onChange={(e) => setRoomSearchRaw(e.target.value)}
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
                                <Button
                                    variant="destructive"
                                    onClick={() => setSelectedBuildingId(null)}
                                    className="cursor-pointer"
                                >
                                    Clear Building Filter
                                </Button>
                            )}

                            <Button
                                // onClick={() => setShowAddRoom(true)}
                                className="cursor-pointer"
                            >
                                <PlusCircle className="mr-1 h-4 w-4" /> Add New Room
                            </Button>
                        </div>
                    </div>

                    {/* ROOMS TABLE*/}
                    <div className="rounded-lg overflow-x-auto border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">Room ID</TableHead>
                                <TableHead className="text-center">Room (Name/Number)</TableHead>
                                <TableHead className="text-center">Building Code</TableHead>
                                <TableHead className="text-center">Description</TableHead>
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
                                        <TableCell className="font-medium">{r.assets_count}</TableCell>
                                        <TableCell>
                                            {(r.assets_count ?? 0).toLocaleString()}{" "}
                                            <span className="text-muted-foreground">({(r.asset_share ?? 0).toFixed(2)}%)</span>
                                        </TableCell>
                                        <TableCell className="h-full">
                                            <div className="flex justify-center items-center gap-2 h-full">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        // setSelectedBuilding(b);
                                                        // setShowEditBuilding(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        // setToDelete(b);
                                                        // setShowDeleteModal(true);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>

                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    asChild 
                                                    className="cursor-pointer"
                                                >
                                                    <Link 
                                                        href={``} 
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
                                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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
            </div>

            <AddBuildingModal
                show={showAddBuilding}
                onClose={() => setShowAddBuilding(false)} 
            />

            {selectedBuilding && (
                <EditBuildingModal
                    show={showEditBuilding}
                    onClose={() => {
                        setShowEditBuilding(false);
                        setSelectedBuilding(null);
                    }}
                    building={selectedBuilding}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (toDelete) {
                        router.delete(`/buildings/${toDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteModal(false);
                                setToDelete(null);
                            },
                        });
                    }
                }}
            />

            {viewBuilding && (
                <ViewBuildingModal
                    open={showViewBuilding}
                    onClose={closeViewBuilding}
                    building={viewBuilding}
                />
            )}
      </AppLayout>
    );
}
