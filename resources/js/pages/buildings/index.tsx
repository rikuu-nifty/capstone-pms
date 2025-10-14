import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

import AddBuildingModal from './AddBuildingModal';
import AddBuildingRoomModal from './AddBuildingRoomModal';

import EditBuildingModal from './EditBuildingModal';
import EditBuildingRoomModal from './EditBuildingRoomModal';
import ViewBuildingModal from './ViewBuildingModal';
import ViewRoomModal from './sections/ViewRoomModal';

import BuildingKPISection from './sections/building-kpi-section';
import BuildingToolbar from './sections/building-toolbar';
import BuildingsTable from './sections/buildings-table';
import RoomsSection from './sections/rooms-section';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import { type SortDir } from '@/components/filters/SortDropdown';
import { type Building, type PageProps as BasePageProps } from '@/types/building';
import { BuildingRoom } from '@/types/custom-index';

import { breadcrumbs, type BuildingSortKey, } from './sections/building-index.helpers';
import { RoomWithAssets } from '@/types/building-room';

type BuildingIndexPageProps = BasePageProps & {
    viewingRoom?: RoomWithAssets;
};

export default function BuildingIndex({ 
    buildings = [], 
    totals,
    viewingRoom
}: BuildingIndexPageProps) {

    const { props } = usePage<BuildingIndexPageProps>();

    const rooms = useMemo(() => props.rooms ?? [], [props.rooms]);

    const [rawSearch, setRawSearch] = useState('');
    const search = useDebouncedValue(rawSearch, 200);

    const [sortKey, setSortKey] = useState<BuildingSortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    
    const [showAddBuilding, setShowAddBuilding] = useState(false);
    const [showAddRoom, setShowAddRoom] = useState(false);

    const [showEditBuilding, setShowEditBuilding] = useState(false);
    const [showEditRoom, setShowEditRoom] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState<BuildingRoom | null>(null);
    
    const [showViewBuilding, setShowViewBuilding] = useState(false);
    const [viewBuilding, setViewBuilding] = useState<Building | null>(null);
    const [showViewRoom, setShowViewRoom] = useState(false);
    const [roomView, setRoomView] = useState<RoomWithAssets | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toDelete, setToDelete] = useState<Building | null>(null);
    const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<BuildingRoom | null>(null);

    const { auth } = usePage<{
        auth: {
            permissions: string[];
            user: { name: string; email: string; role?: { name: string; code: string } };
            unit_or_department?: { id: number; name: string; code: string };
        };
    }>().props;

    const canViewAll = auth.permissions.includes('view-buildings');
    const canViewOwn = auth.permissions.includes('view-own-unit-buildings');

    const canCreateBuilding = auth.permissions.includes('create-buildings');
    const canUpdateBuilding = auth.permissions.includes('update-buildings');
    const canDeleteBuilding = auth.permissions.includes('delete-buildings');

    const canCreateRoom = auth.permissions.includes('create-building-rooms');
    const canUpdateRoom = auth.permissions.includes('update-building-rooms');
    const canDeleteRoom = auth.permissions.includes('delete-building-rooms');

    useEffect(() => {
        if (props.selected) setSelectedBuildingId(Number(props.selected));
    }, [props.selected]);

    useEffect(() => {
        if (props.viewing) {
            setViewBuilding(props.viewing);
            setShowViewBuilding(true);
        }
    }, [props.viewing]);

    useEffect(() => {
        if (viewingRoom) {
            setRoomView(viewingRoom);
            setShowViewRoom(true);
        }
    }, [
        viewingRoom
    ]);

    const closeViewRoom = () => {
        setShowViewRoom(false);
        setRoomView(null);
        if (/^\/?buildings\/rooms\/view\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    const closeViewBuilding = () => {
        setShowViewBuilding(false);
        setViewBuilding(null);
        if (/^\/?buildings\/view\/\d+\/?$/.test(window.location.pathname)) {
            history.back();
        }
    };

    return (
        <AppLayout breadcrumbs={
            breadcrumbs as BreadcrumbItem[]
        }>
            <Head title="Buildings" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Buildings</h1>
                        <p className="text-sm text-muted-foreground">List of AUF buildings.</p>

                        {canViewOwn && !canViewAll && (
                            <div className="mt-2 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 text-sm">
                                You are viewing <strong>only the buildings and rooms assigned to your unit/department</strong>
                                {auth.unit_or_department?.name && (
                                    <>
                                        <span>:</span>
                                        <span className="ml-1 font-semibold text-blue-800">
                                            {auth.unit_or_department.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <BuildingKPISection totals={totals} />

                    <BuildingToolbar
                        search={search}
                        onSearchChange={setRawSearch}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSortChange={(key, dir) => { 
                            setSortKey(key); 
                            setSortDir(dir); 
                        }}
                        onAdd={() => 
                            setShowAddBuilding(true)
                        }
                        canCreate={canCreateBuilding}
                    />
                </div>

                {/* Buildings table */}
                <BuildingsTable
                    buildings={buildings}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    search={search}
                    selectedBuildingId={selectedBuildingId}
                    onSelect={setSelectedBuildingId}
                    onEdit={(b) => {
                        setSelectedBuilding(b); 
                        setShowEditBuilding(true); 
                    }}
                    onDelete={(b) => { 
                        setToDelete(b); 
                        setShowDeleteModal(true); 
                    }}
                    canUpdate={canUpdateBuilding}
                    canDelete={canDeleteBuilding}
                />

                {/* Rooms section */}
                <RoomsSection
                    buildings={buildings}
                    rooms={rooms as BuildingRoom[]}
                    selectedBuildingId={selectedBuildingId}
                    onClearSelectedBuilding={() => 
                        setSelectedBuildingId(null)
                    }
                    onAddRoomClick={() => 
                        setShowAddRoom(true)
                    }
                    onEditRoomClick={(room) => { 
                        setRoomToEdit(room); setShowEditRoom(true); 
                    }}
                    onDeleteRoomClick={(room) => { 
                        setRoomToDelete(room); 
                        setShowDeleteRoomModal(true); 
                    }}
                    canCreate={canCreateRoom}
                    canUpdate={canUpdateRoom}
                    canDelete={canDeleteRoom}
                />
            </div>

            <AddBuildingModal
                show={showAddBuilding}
                onClose={() => 
                    setShowAddBuilding(false)
                }
            />

            {selectedBuilding && (
                <EditBuildingModal
                    show={showEditBuilding}
                    onClose={() => { 
                        setShowEditBuilding(false); 
                        setSelectedBuilding(null); 
                    }}
                    building={selectedBuilding}
                    allRooms={rooms}
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

            <AddBuildingRoomModal
                show={showAddRoom}
                onClose={() => 
                    setShowAddRoom(false)
                }
                buildings={buildings}
                defaultBuildingId={selectedBuildingId ?? null}
                lockBuildingSelect={selectedBuildingId !== null}
            />

            <EditBuildingRoomModal
                show={showEditRoom}
                onClose={() => { 
                    setShowEditRoom(false); 
                    setRoomToEdit(null);
                }}
                buildings={buildings}
                room={roomToEdit}
            />

            <DeleteConfirmationModal
                show={showDeleteRoomModal}
                onCancel={() => setShowDeleteRoomModal(false)}
                onConfirm={() => {
                    if (roomToDelete) {
                        router.delete(`/building-rooms/${roomToDelete.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowDeleteRoomModal(false);
                                setRoomToDelete(null);
                            },
                        });
                    }
                }}
            />

            {roomView && (
                <ViewRoomModal 
                    open={showViewRoom} 
                    onClose={closeViewRoom} 
                    room={roomView} 
                />
            )}
        </AppLayout>
    );
}