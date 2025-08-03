import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Transfer Schedule',
        href: '/transfers/add-new-transfer-schedule',
    },
];  

export default function AddTransfer() {
 
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test" />

            <div className="flex flex-col gap-4 p-4">
                
            </div>
        </AppLayout>
    );
}
