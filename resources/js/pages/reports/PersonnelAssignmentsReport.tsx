import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardList, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Personnel Assignments Report', href: '/reports/personnel-assignments' },
];

export default function PersonnelAssignmentsReport() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Personnel Assignments Report" />

        <div className="space-y-6 px-6 py-4">
            {/* Header */}
            <div>
            <h1 className="text-2xl font-semibold">Personnel Assignments Report</h1>
            <p className="text-sm text-muted-foreground">
                Overview of designated personnel and their assigned assets — both current and past.
            </p>
            </div>

            {/* Placeholder Card */}
            <Card className="rounded-2xl shadow-md border">
            <CardHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                <CardTitle>Report Under Development</CardTitle>
                </div>
                <CardDescription>
                This report will display a breakdown of assets currently and previously assigned to each personnel.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex h-64 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <ClipboardList className="h-10 w-10 text-gray-400 mb-2" />
                <p>Data visualization and export options coming soon.</p>
                <p className="mt-1 text-xs">Stay tuned for current/past asset comparisons per personnel.</p>
            </CardContent>
            </Card>
        </div>
        </AppLayout>
    );
}
