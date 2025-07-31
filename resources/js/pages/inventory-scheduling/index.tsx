import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Scheduling',
        href: '/inventory-scheduling',
    },
];

export default function InventorySchedulingIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Scheduling" />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Inventory Scheduling</h1>

                {/* You can add buttons, filters, or tables here later */}
                <div className="text-muted-foreground">
                    This is the Inventory Scheduling page.
                </div>
            </div>
        </AppLayout>
    );
}
