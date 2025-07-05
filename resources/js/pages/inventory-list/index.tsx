// import { router } from '@inertiajs/react';
// import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

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
import { Head, useForm } from '@inertiajs/react';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';

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
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        building: '',
        unit_or_department: '',
        building_room: '',
        date_purchased: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        quantity: '',
        supplier: '',
        unit_cost: '',
        serial_no: '',
        asset_model: '',
        transfer_status: '',
        description: '',
        memorandum_no: '',
    });

    // Form Submit Handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory-list', {
            onSuccess: () => {
                console.log('Form Submitted');
                reset(); // Clear form fields after successful post
                setShowAddAsset(false); // Close the modal
            },
        });

        console.log('Form Submitted:', data); // Debugging log
    };

    const [search, setSearch] = useState('');
    const [showAddAsset, setShowAddAsset] = useState(false);

    useEffect(() => {
        if (!showAddAsset) {
            reset(); // Reset form fields when modal is closed
            clearErrors();
        }
    }, [showAddAsset, reset, clearErrors]);

    const closeModal = () => {
        reset(); // Clears all input fields
        clearErrors(); // Clears all error messages
        setShowAddAsset(false); // Hides the modal
    };

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
                        <Button
                            onClick={() => {
                                reset(); // clear all field values
                                clearErrors(); // clear all error messages
                                setShowAddAsset(true); // open modal
                            }}
                            className="cursor-pointer"
                        >
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
                ></div>

                <div
                    className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                        showAddAsset ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <div className="mb-4 flex items-center justify-between p-6">
                        <h2 className="text-xl font-semibold">Add New Asset</h2>
                        <button onClick={() => setShowAddAsset(false)} className="cursor-pointer text-2xl font-medium">
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Form Section */}
                    <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                        {' '}
                        {/*overflow-y-auto */}
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                            {/* Top Section */}
                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Building</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.building}
                                    onChange={(e) => setData('building', e.target.value)}
                                >
                                    <option value="">Select Building</option>
                                </select>
                                {errors.building && <p className="mt-1 text-xs text-red-500">{errors.building}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Unit/Department</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.unit_or_department}
                                    onChange={(e) => setData('unit_or_department', e.target.value)}
                                >
                                    <option value="">Select Unit</option>
                                </select>
                                {errors.unit_or_department && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block font-medium">Room</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.building_room}
                                    onChange={(e) => setData('building_room', e.target.value)}
                                >
                                    <option value="">Select Room</option>
                                </select>
                                {errors.building_room && <p className="mt-1 text-xs text-red-500">{errors.building_room}</p>}
                            </div>

                            {/* Divider */}
                            <div className="col-span-2 border-t"></div>

                            {/* Middle Section */}
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Date Purchased</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={data.date_purchased}
                                    onChange={(e) => setData('date_purchased', e.target.value)}
                                />
                                {errors.date_purchased && <p className="mt-1 text-xs text-red-500">{errors.date_purchased}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Type</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.asset_type}
                                    onChange={(e) => setData('asset_type', e.target.value)}
                                >
                                    <option value="">Select Assets Category</option>
                                </select>
                                {errors.asset_type && <p className="mt-1 text-xs text-red-500">{errors.asset_type}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Asset Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Assets"
                                    value={data.asset_name}
                                    onChange={(e) => setData('asset_name', e.target.value)}
                                />
                                {errors.asset_name && <p className="mt-1 text-xs text-red-500">{errors.asset_name}</p>}

                                {/* <InputError message={errors.asset_name}/>  */}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Brand</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Brand"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                />
                                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Supplier</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Suppliers"
                                    value={data.supplier}
                                    onChange={(e) => setData('supplier', e.target.value)}
                                />
                                {errors.supplier && <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Unit Cost</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Unit Cost"
                                    value={data.unit_cost}
                                    onChange={(e) => setData('unit_cost', e.target.value)}
                                />
                                {errors.unit_cost && <p className="mt-1 text-xs text-red-500">{errors.unit_cost}</p>}
                            </div>
                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Serial Number</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Serial No."
                                    value={data.serial_no}
                                    onChange={(e) => setData('serial_no', e.target.value)}
                                />
                                {errors.serial_no && <p className="mt-1 text-xs text-red-500">{errors.serial_no}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Model</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Model"
                                    value={data.asset_model}
                                    onChange={(e) => setData('asset_model', e.target.value)}
                                />
                                {errors.asset_model && <p className="mt-1 text-xs text-red-500">{errors.asset_model}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Memorandum Number</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Enter Memorandum No."
                                    value={data.memorandum_no}
                                    onChange={(e) => setData('memorandum_no', e.target.value)}
                                />
                                {errors.memorandum_no && <p className="mt-1 text-xs text-red-500">{errors.memorandum_no}</p>}
                            </div>

                            <div className="col-span-1 pt-0.5">
                                <label className="mb-1 block font-medium">Transfer Status</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.transfer_status}
                                    onChange={(e) => setData('transfer_status', e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                </select>
                                {errors.transfer_status && <p className="mt-1 text-xs text-red-500">{errors.transfer_status}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block font-medium">Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full resize-none rounded-lg border p-2"
                                    placeholder="Enter Description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>

                            {/* Buttons Footer inside the form */}

                            <div className="col-span-2 flex justify-end gap-2 border-t border-muted pt-4">
                                <Button variant="secondary" onClick={closeModal} className="cursor-pointer">
                                    Cancel
                                </Button>
                                <Button type="submit" className="cursor-pointer" disabled={processing}>
                                    Add New Asset
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
