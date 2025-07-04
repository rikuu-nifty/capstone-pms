// import { router } from '@inertiajs/react';
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
    const [showAddAsset, setShowAddAsset] = useState(false);

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

                    <div className="flex gap-2">
                        <Button variant="outline" className="cursor-pointer">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>

                        <Button variant="outline" className="cursor-pointer">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>

                        {/* <Link href="/inventory-list/create" as="button"> */}
                        {/* <Button onClick={() => router.visit('/inventory-list.create')}> */}
                        <Button onClick={() => setShowAddAsset(true)} className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4" /> Add Asset
                        </Button>
                        {/* </Link> */}
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="font-medium">Asset Name</TableHead>
                                <TableHead className="font-medium">Brand</TableHead>
                                <TableHead className="font-medium">Date Purchased</TableHead>
                                <TableHead className="font-medium">Asset Type</TableHead>
                                <TableHead className="font-medium">Quantity</TableHead>
                                <TableHead className="font-medium">Building</TableHead>
                                <TableHead className="font-medium">Unit/Dept</TableHead>
                                <TableHead className="font-medium">Status</TableHead>
                                <TableHead className="font-medium">Action</TableHead>
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

            {/* Side Panel Modal with Slide Effect */}
            <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${showAddAsset ? 'visible' : 'invisible'}`}>
                <div
                    className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showAddAsset ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowAddAsset(false)}
                >
                </div>

                <div
                    className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddAsset ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{ maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="mb-4 flex items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Add New Asset</h2>
                        <button onClick={() => setShowAddAsset(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Form Section */}
                    <div className="overflow-y-auto px-6" style={{ flex: 1 }}>
                        <form className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                            {/* Top Section */}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Building</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Select Building</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Unit/Department</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Select Unit</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Room</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Select Room</option>
                                </select>
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t"></div>

                            {/* Middle Section */}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Date Purchased</label>
                                <input type="date" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Memorandum No.</label>
                                <input type="text" placeholder="Enter Memorandum" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Asset Name</label>
                                <input type="text" placeholder="Enter Assets" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Brand</label>
                                <input type="text" placeholder="Enter Brand" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Quantity</label>
                                <input type="number" placeholder="Enter Quantity" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Supplier</label>
                                <input type="text" placeholder="Enter Suppliers" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Unit Cost</label>
                                <input type="number" placeholder="Enter Unit Cost" className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Asset Type</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Select Assets Category</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Serial no./s</label>
                                <input type="text" placeholder="Enter Serial No." className="w-full rounded-lg border p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Model</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Choose Model</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Transfer Status</label>
                                <select className="w-full rounded-lg border p-2">
                                    <option>Select Status</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Description</label>
                                <textarea rows={3} placeholder="Enter description..." className="w-full resize-none rounded-lg border p-2" />
                            </div>
                        </form>
                    </div>
                    {/* Buttons Footer */}
                    <div className="flex justify-end gap-2 border-t border-muted p-6">
                        <Button variant="secondary" onClick={() => setShowAddAsset(false)} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button className="cursor-pointer">Add New Asset</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
