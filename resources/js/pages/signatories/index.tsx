import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AddSignatoryModal from './AddSignatoryModal';
import EditSignatoryModal from './EditSignatoryModal';

type Signatory = {
    id: number;
    module_type: string;
    role_key: string;
    name: string;
    title: string;
};

type PageProps = {
    signatories: Record<string, Signatory>;
    moduleType: string;
};

export default function SignatoriesIndex() {

    const { auth } = usePage().props as unknown as {
        auth: {
            permissions: string[];
        };
    };

    // const canCreate = auth.permissions.includes('create-signatories');
    const canEdit = auth.permissions.includes('update-signatories');
    const canDelete = auth.permissions.includes('delete-signatories');

    const tabs = [
        { key: 'inventory_scheduling', label: 'Inventory Scheduling' },
        { key: 'property_transfer', label: 'Property Transfer' },
        { key: 'turnover_disposal', label: 'Turnover/Disposal' },
        { key: 'off_campus', label: 'Off-Campus' },
    ] as const;

    const roleLabels: Record<string, string> = {
        prepared_by: 'Prepared by',
        approved_by: 'Approved by',
        received_by: 'Received by',
        noted_by: 'Noted by',
        issued_by: 'Issued by'
    };

    const { signatories, moduleType } = usePage<PageProps>().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editSignatory, setEditSignatory] = useState<Signatory | null>(null);
    const [deleteSignatory, setDeleteSignatory] = useState<Signatory | null>(null);

    const handleTabChange = (type: string) => {
        router.get(route('signatories.index'), { module_type: type }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Signatories', href: '/signatories' }]}>
            <Head title="Signatories Management" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Signatories Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Unified management of approval signatories across all property management processes
                        </p>
                    </div>
                    {/* 
                    {canCreate && (
                        <Button onClick={() => setShowAddModal(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Signatory
                        </Button>
                    )}*/}
                </div>

                {/* Tab Bar */}
                <div className="mb-4 flex gap-2 rounded-md bg-muted p-2">
                    {tabs.map((t) => (
                        <Button
                            key={t.key}
                            variant={moduleType === t.key ? 'default' : 'ghost'}
                            className="cursor-pointer"
                            onClick={() => handleTabChange(t.key)}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>

                {/* Table Content*/}
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead className="text-center">Role Key</TableHead>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Title</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-center">
                            {Object.values(signatories).length > 0 ? (
                                Object.values(signatories).map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{roleLabels[s.role_key] ?? s.role_key}</TableCell>
                                        <TableCell>{s.name}</TableCell>
                                        <TableCell>{s.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                    <Button 
                                                        size="icon"
                                                        className="cursor-pointer disabled:bg-gray-600 disabled:text-gray-300 disabled:opacity-100 " 
                                                        variant="outline" 
                                                        onClick={() => setEditSignatory(s)}
                                                        disabled={!canEdit}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button 
                                                        size="icon"
                                                        className="cursor-pointer disabled:bg-gray-600 disabled:text-gray-300 disabled:opacity-100 " 
                                                        variant="destructive" 
                                                        onClick={() => setDeleteSignatory(s)}
                                                        disabled={!canDelete}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                                        No signatories found for this module.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Modal */}
                <AddSignatoryModal open={showAddModal} onClose={() => setShowAddModal(false)} moduleType={moduleType} />

                {/* Edit Modal */}
                {editSignatory && (
                    <EditSignatoryModal
                        open={!!editSignatory}
                        onClose={() => setEditSignatory(null)}
                        signatory={editSignatory}
                        moduleType={moduleType} // ✅ keep this
                    />
                )}

                {/* Delete Confirmation Modal */}
                {deleteSignatory && (
                    <DeleteConfirmationModal
                        show={!!deleteSignatory}
                        onCancel={() => setDeleteSignatory(null)}
                        onConfirm={() =>
                            router.delete(route('signatories.destroy', deleteSignatory.id), {
                                data: { module_type: moduleType }, // ✅ send active tab type
                                onSuccess: () => setDeleteSignatory(null),
                            })
                        }
                        title="Confirm Deletion"
                        message={`Are you sure you want to delete the signatory "${deleteSignatory.name}"?`}
                    />
                )}
            </div>
        </AppLayout>
    );
}
