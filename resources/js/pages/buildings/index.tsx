import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
// import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';

import { Building } from '@/types/building';
import AddBuildingModal from './AddBuildingModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Buildings',
        href: '/buildings',
    },
];

export default function BuildingIndex({ 
    buildings = [] 
}: { 
    buildings: Building[] 
}) {
    const [search, setSearch] = useState('');

    const [showAddBuilding, setShowAddBuilding] = useState(false);

    const filteredBuildings = buildings.filter((b) =>
        `${b.name} ${b.code} ${b.description}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buildings" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Buildings</h1>
                        <p className="text-sm text-muted-foreground">
                            List of all registered AUF buildings.
                        </p>
                        <Input
                            type="text"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                    <Button 
                        className="cursor-pointer"
                        onClick={() => {
                            setShowAddBuilding(true);
                        }}
                    >
                        <PlusCircle 
                            className="mr-2 h-4 w-4" 
                        /> 
                        Add Building
                    </Button>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">Building Code</TableHead>
                                <TableHead className="text-center">Building Name</TableHead>
                                <TableHead className="text-center">Description</TableHead>
                                <TableHead className="text-center">Room Count</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBuildings.length > 0 ? (
                                filteredBuildings.map((building) => (
                                    <TableRow className="text-center" key={building.id}>
                                        <TableCell>{building.code}</TableCell>
                                        <TableCell>{building.name}</TableCell>
                                        <TableCell>{building.description || '—'}</TableCell>
                                        <TableCell>{building.building_rooms_count || '—'}</TableCell>
                                        
                                        <TableCell className="flex gap-2 justify-center">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button 
                                                size="icon" 
                                                variant="ghost"
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            <Button 
                                                size="icon" 
                                                variant="ghost"
                                                className="cursor-pointer"
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>

                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                        No buildings found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddBuildingModal
                show = {showAddBuilding}
                onClose={() => 
                    setShowAddBuilding(false)
                }
            />

        </AppLayout>
    );
}
