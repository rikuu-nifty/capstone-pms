import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    // TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory List',
        href: '/inventory-list',
    },
];

const mockData = [
    {
        asset_name: 'Monitor',
        brand: 'Gamdias',
        date_purchased: 'May 29, 2025',
        asset_type: 'Electronic',
        quantity: 2,
        building: 'PS Building',
        department: "CAMP-Dean's Office",
        status: 'active',
    },
    {
        asset_name: 'Monitor',
        brand: 'Gamdias',
        date_purchased: 'May 29, 2025',
        asset_type: 'Electronic',
        quantity: 2,
        building: 'PS Building',
        department: "CAMP-Dean's Office",
        status: 'archived',
    },
];

export default function Index() {
    const [search, setSearch] = useState('');

    const filteredData = mockData.filter((item) => item.asset_name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory List" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Inventory List</h1>
                        <p className="text-sm text-muted-foreground">
                            Provides a comprehensive overview of all university assets to facilitate accurate tracking and auditing.
                        </p>
                        <Input
                            type="text"
                            placeholder="Search by asset name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2" >
                        <Button variant="outline" className="cursor-pointer">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>

                        <Button variant="outline" className="cursor-pointer">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>

                        {/* <Link href="/inventory-list/create" as="button"> */}
                        {/* <Button onClick={() => router.visit('/inventory-list.create')}> */} 
                            <Button onClick={() => router.visit('/inventory-list/add-asset')} className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4"  /> Add Asset
                        </Button>
                        {/* </Link> */}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="font-bold">Asset Name</TableHead>
                                <TableHead className="font-bold">Brand</TableHead>
                                <TableHead className="font-bold">Date Purchased</TableHead>
                                <TableHead className="font-bold">Asset Type</TableHead>
                                <TableHead className="font-bold">Quantity</TableHead>
                                <TableHead className="font-bold">Building</TableHead>
                                <TableHead className="font-bold">Unit/Dept</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.asset_name}</TableCell>
                                    <TableCell>{item.brand}</TableCell>
                                    <TableCell>{item.date_purchased}</TableCell>
                                    <TableCell>{item.asset_type}</TableCell>
                                    <TableCell>{String(item.quantity).padStart(2, '0')}</TableCell>
                                    <TableCell>{item.building}</TableCell>
                                    <TableCell>{item.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                            {item.status === 'active' ? 'Active' : 'Archive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="cursor-pointer">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="cursor-pointer">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="cursor-pointer">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
