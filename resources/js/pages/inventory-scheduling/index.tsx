import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Scheduling',
        href: '/inventory-scheduling',
    },
];

export default function InventorySchedulingIndex() {
    const [search, setSearch] = useState('');

    // 1 mock data row
    const data = [
        {
            id: 1,
            building: 'SCC Building',
            department: 'SC, Sport Coordinator',
            scheduleMonth: 'May',
            actualDate: 'May 29, 2025',
            checkedBy: 'Ramaert Millare',
            verifiedBy: 'Jansen Venal',
            receivedBy: 'Bien Tubil',
            status: 'completed',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Scheduling" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Inventory Scheduling</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and monitor scheduled inventory checks by room and department.
                        </p>
                        <Input
                            type="text"
                            placeholder="Search by building, department, or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>
                        <Button variant="outline">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>
                        <Button className="cursor-pointer">
                            <PlusCircle className="mr-1 h-4 w-4" /> Schedule Inventory
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="w-20">ID no.</TableHead>
                                <TableHead>Building</TableHead>
                                <TableHead>Unit/Dept/Laboratories</TableHead>
                                <TableHead>Inventory Schedule</TableHead>
                                <TableHead>Actual Date of Inventory</TableHead>
                                <TableHead>Checked By</TableHead>
                                <TableHead>Verified By</TableHead>
                                <TableHead>Received By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow key={data[0].id}>
                                <TableCell>{String(data[0].id).padStart(2, '0')}</TableCell>
                                <TableCell>{data[0].building}</TableCell>
                                <TableCell>{data[0].department}</TableCell>
                                <TableCell>{data[0].scheduleMonth}</TableCell>
                                <TableCell>{data[0].actualDate}</TableCell>
                                <TableCell>{data[0].checkedBy}</TableCell>
                                <TableCell>{data[0].verifiedBy}</TableCell>
                                <TableCell>{data[0].receivedBy}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            data[0].status === 'completed'
                                                ? 'default'
                                                : data[0].status === 'pending'
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {data[0].status.charAt(0).toUpperCase() + data[0].status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button size="icon" variant="ghost">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <Button size="icon" variant="ghost">
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
