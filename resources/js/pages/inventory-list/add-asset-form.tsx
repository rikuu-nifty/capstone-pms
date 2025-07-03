// import { router } from '@inertiajs/react';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//     Table,
//     TableBody,
//     // TableCaption,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
// import { Eye, Filter, Grid, Pencil, PlusCircle, Trash2 } from 'lucide-react';
// import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Asset',
        href: '/inventory-list/add-asset',
    },
];  

export default function AddInventory() {
 
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory List" />

            <div className="flex flex-col gap-4 p-4">
                
            </div>
        </AppLayout>
    );
}
