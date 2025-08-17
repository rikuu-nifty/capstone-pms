import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginatorOffCampus';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, PlusCircle, Grid, Filter, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import OffCampusAddModal from './OffCampusAddModal';
import OffCampusEditModal from './OffCampusEditModal';

// -------------------- TYPES --------------------

type OffCampusAsset = {
    id: number;
    asset_id: number;
    asset_model_id: number | null;
    asset?: {
        id: number;
        asset_model_id: number | null;
        asset_name: string;
        description: string | null;
        serial_no: string | null;
        asset_model?: { id: number; brand: string; model: string } | null;
    } | null;
};

type OffCampus = {
    id: number;
    requester_name: string;
    college_or_unit_id: number | null;
    purpose: string;
    date_issued: string;
    return_date: string | null;
    quantity: number;
    units: string;
    remarks: 'official_use' | 'repair';
    comments?: string | null;
    approved_by?: string | null;
    issued_by_id?: number | null;
    checked_by?: string | null;

    assets?: OffCampusAsset[];
    asset_model?: { id: number; brand: string; model: string } | null;
    college_or_unit?: { id: number; name: string; code: string } | null;
    issued_by?: { id: number; name: string } | null;
};

type Asset = { id: number; asset_model_id: number | null; asset_name: string; serial_no: string | null };
type AssetModel = { id: number; brand: string; model: string };
type User = { id: number; name: string };
type UnitOrDepartment = { id: number; name: string; code: string };

type Props = {
    offCampuses: Paginator<OffCampus>;
    unitOrDepartments: UnitOrDepartment[];
    units?: string[];
    assets: Asset[];
    assetModels: AssetModel[];
    users: User[];
};

// -------------------- HELPERS --------------------

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Off Campus', href: '/off-campus' }];

function formatDate(d?: string | null) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d!;
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function humanizeRemarks(v: string) {
    if (!v) return '—';
    return v.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// -------------------- COMPONENT --------------------

export default function OffCampusIndex({
    offCampuses,
    unitOrDepartments,
    units = ['pcs', 'set', 'unit', 'pair', 'dozen', 'box', 'pack', 'roll', 'bundle', 'kg', 'g', 'lb', 'ton', 'L', 'ml', 'gal'],
    assets,
    assetModels,
    users,
}: Props) {
    const rows = offCampuses.data;
    const [search, setSearch] = useState('');
    const [selectedOffCampus, setSelectedOffCampus] = useState<OffCampus | null>(null);
    const [showAddOffCampus, setShowAddOffCampus] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    // 🔻 delete (archive) modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offCampusToDelete, setOffCampusToDelete] = useState<Pick<OffCampus, 'id'> | null>(null);

    const confirmDelete = () => {
        if (!offCampusToDelete) return;
        router.delete(route('off-campus.destroy', offCampusToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setOffCampusToDelete(null);
            },
        });
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return rows;

        return rows.filter((row) => {
            const assetStrings = (row.assets ?? [])
                .map((a) =>
                    [a.asset?.asset_name, a.asset?.description, a.asset?.serial_no, a.asset?.asset_model?.brand, a.asset?.asset_model?.model]
                        .filter(Boolean)
                        .join(' '),
                )
                .join(' ');

            const fields = [
                row.requester_name,
                row.college_or_unit?.name,
                row.college_or_unit?.code,
                row.asset_model?.brand,
                row.asset_model?.model,
                row.remarks,
                row.purpose,
                assetStrings,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return fields.includes(q);
        });
    }, [search, rows]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Off Campus" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header + Search */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">Off Campus</h1>
                        <p className="text-sm text-muted-foreground">Forms authorizing items to be brought out of AUF premises.</p>
                        <Input
                            type="text"
                            placeholder="Search requester, unit, item, serial, brand/model…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md"
                        />
                    </div>


                          <div className="flex gap-2">
                        <Button variant="outline">
                            <Grid className="mr-1 h-4 w-4" /> Category
                        </Button>
                        <Button variant="outline">
                            <Filter className="mr-1 h-4 w-4" /> Filter
                        </Button>
                    <Button onClick={() => setShowAddOffCampus(true)} className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Off Campus
                    </Button>
                    </div>

                </div>

                {/* Table */}
                <div className="rounded-lg-lg overflow-x-auto border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted text-foreground">
                                <TableHead className="text-center">College/Unit</TableHead>
                                <TableHead className="text-center">Requester Name</TableHead>
                                <TableHead className="text-center">Date Issued</TableHead>
                                <TableHead className="text-center">Return Date</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-center">Remarks</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((row) => (
                                    <TableRow className="text-center" key={row.id}>
                                        <TableCell>
                                            {row.college_or_unit ? `${row.college_or_unit.name} (${row.college_or_unit.code})` : '—'}
                                        </TableCell>
                                        <TableCell>{row.requester_name || '—'}</TableCell>
                                        <TableCell>{formatDate(row.date_issued)}</TableCell>
                                        <TableCell>{formatDate(row.return_date)}</TableCell>
                                        <TableCell>{row.quantity}</TableCell>
                                        <TableCell>{row.units}</TableCell>
                                        <TableCell>{humanizeRemarks(row.remarks)}</TableCell>

                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedOffCampus(row);
                                                    setEditModalVisible(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setOffCampusToDelete({ id: row.id });
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            <Link href={`/off-campus/${row.id}`}>
                                                <Button size="icon" variant="ghost" className="cursor-pointer">
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                        No Off Campus Records Found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Modal */}
                <OffCampusAddModal
                    show={showAddOffCampus}
                    onClose={() => setShowAddOffCampus(false)}
                    unitOrDepartments={unitOrDepartments}
                    units={units}
                    assets={assets}
                    assetModels={assetModels}
                    users={users}
                />

                {/* Edit Modal */}
                {editModalVisible && selectedOffCampus && (
                    <OffCampusEditModal
                        offCampus={selectedOffCampus}
                        onClose={() => {
                            setEditModalVisible(false);
                            setSelectedOffCampus(null);
                        }}
                        unitOrDepartments={unitOrDepartments}
                        assets={assets}
                        assetModels={assetModels}
                        users={users}
                    />
                )}

                {/* Delete (Archive) Modal */}
                <DeleteConfirmationModal show={showDeleteModal} onCancel={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />
            </div>
        </AppLayout>
    );
}
