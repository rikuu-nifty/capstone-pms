// index.tsx (refactored)
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
// import { Button } from '@/components/ui/button';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import AddBuildingModal from './AddBuildingModal';
import EditBuildingModal from './EditBuildingModal';
import ViewBuildingModal from './ViewBuildingModal';
import BuildingKPISection from './sections/building-kpi-section';
import BuildingToolbar from './sections/building-toolbar';
import BuildingsTable from './sections/buildings-table';
import RoomsSection from './sections/rooms-section';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { type SortDir } from '@/components/filters/SortDropdown';
import { type Building, type PageProps } from '@/types/building';
import { BuildingRoom } from '@/types/custom-index';

import {
    breadcrumbs,
    type BuildingSortKey,
} from './sections/building-index.helpers';

export default function BuildingIndex({ 
    buildings = [], 
    totals 
}: PageProps) {
const { props } = usePage<PageProps>();

const rooms = useMemo(() => props.rooms ?? [], [props.rooms]);

const [rawSearch, setRawSearch] = useState(''); // building
const search = useDebouncedValue(rawSearch, 200);

const [sortKey, setSortKey] = useState<BuildingSortKey>('id');
const [sortDir, setSortDir] = useState<SortDir>('asc');

const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
const [showAddBuilding, setShowAddBuilding] = useState(false);
const [showEditBuilding, setShowEditBuilding] = useState(false);
const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
const [showViewBuilding, setShowViewBuilding] = useState(false);
const [viewBuilding, setViewBuilding] = useState<Building | null>(null);

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [toDelete, setToDelete] = useState<Building | null>(null);

useEffect(() => {
    if (props.selected) setSelectedBuildingId(Number(props.selected));
}, [props.selected]);

useEffect(() => {
    if (props.viewing) {
        setViewBuilding(props.viewing);
        setShowViewBuilding(true);
    }
}, [props.viewing]);

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
                />

                {/* Rooms section */}
                <RoomsSection
                    buildings={buildings}
                    rooms={rooms as BuildingRoom[]}
                    selectedBuildingId={selectedBuildingId}
                    onClearSelectedBuilding={() => setSelectedBuildingId(null)}
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