import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, PlusCircle, Trash2, PackageCheck, Users } from 'lucide-react';
import Pagination, { PageInfo } from '@/components/Pagination';
import { formatDateLong } from '@/types/custom-index';
import type { AssignmentPageProps, AssetAssignment } from '@/types/asset-assignment';

import AddAssignmentModal from './AddAssignmentModal';
import EditAssignmentModal from './EditAssignmentModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Assignments', href: '/assignments' },
];

export default function AssignmentsIndex({ 
    assignments, 
    totals, 
    personnels,
    units,
    assets,
    currentUser,
}: AssignmentPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [toEdit, setToEdit] = useState<AssetAssignment | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState<AssetAssignment | null>(null);

  const page_items = assignments.data;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Asset Assignments" />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Asset Assignments</h1>
            <p className="text-sm text-muted-foreground">
              Records of assets assigned to personnels.
            </p>
          </div>

          <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
            <PlusCircle className="mr-1 h-4 w-4" /> New Assignment
          </Button>
        </div>

        {/* KPIs */}
        {totals && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Assignments</div>
                <div className="text-3xl font-bold">
                  {Number(totals.total_assignments ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <PackageCheck className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Assets Assigned</div>
                <div className="text-3xl font-bold">
                  {Number(totals.total_assets_assigned ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Users className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Personnels w/ Assets</div>
                <div className="text-3xl font-bold">
                  {Number(totals.total_personnels_with_assets ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg-lg overflow-x-auto border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted text-foreground">
                <TableHead className="text-center">Reference</TableHead>
                <TableHead className="text-center">Personnel</TableHead>
                <TableHead className="text-center">Unit/Department</TableHead>
                <TableHead className="text-center">Assets Count</TableHead>
                <TableHead className="text-center">Date Assigned</TableHead>
                <TableHead className="text-center">Assigned By</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-center">
              {page_items.length > 0 ? (
                page_items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>#{a.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{a.personnel?.full_name ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{a.personnel?.position ?? ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.personnel?.unit_or_department?.name ?? '—'}</TableCell>
                    <TableCell>{a.items_count ?? 0}</TableCell>
                    <TableCell>{formatDateLong(a.date_assigned)}</TableCell>
                    <TableCell>{a.assigned_by_user?.name ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setToEdit(a);
                            setShowEdit(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setToDelete(a);
                            setShowDelete(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: open view modal
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <PageInfo
            page={assignments.current_page}
            total={assignments.total}
            pageSize={assignments.per_page}
            label="records"
          />
          <Pagination
            page={assignments.current_page}
            total={assignments.total}
            pageSize={assignments.per_page}
            onPageChange={(p) => {
              router.get('/assignments', { page: p }, { preserveScroll: true });
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <AddAssignmentModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        assets={assets}
        personnels={personnels}
        units={units}
        currentUserId={currentUser?.id ?? 0}
    />


      {toEdit && (
        <EditAssignmentModal
          show={showEdit}
          onClose={() => {
            setShowEdit(false);
            setToEdit(null);
          }}
          assignment={toEdit}
          assets={assets}          
          personnels={personnels}  
          units={units}         
        />
      )}


      <DeleteConfirmationModal
        show={showDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this assignment?"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          if (toDelete) {
            router.delete(`/assignments/${toDelete.id}`, {
              preserveScroll: true,
              onSuccess: () => {
                setShowDelete(false);
                setToDelete(null);
              },
            });
          }
        }}
      />
    </AppLayout>
  );
}
