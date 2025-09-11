import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';
import { useState } from 'react';
import type { Building } from '@/types/building';
import type { UnitOrDepartment } from '@/types/custom-index';
import type { BuildingRoom } from '@/types/building-room';
import type { SubArea } from '@/types/custom-index';
import type { InventoryReportRow } from '@/types/custom-index';

interface Props {
  buildings: Building[];
  departments: UnitOrDepartment[];
  rooms: BuildingRoom[];
  subAreas: SubArea[];
}

export default function InventorySheetReport({ buildings, departments, rooms, subAreas }: Props) {
    const [report, setReport] = useState<InventoryReportRow[]>([]);

    const { data, setData, processing } = useForm({
        building_id: '',
        unit_or_department_id: '',
        building_room_id: '',
        sub_area_id: '',
    });

    const generateReport = async () => {
        try {
            const response = await fetch(route('reports.inventory-sheet.generate'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
            },
            body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to fetch report');

            const result: InventoryReportRow[] = await response.json();
            setReport(result);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AppLayout
        breadcrumbs={[
            { title: 'Reports', href: '/reports' },
            { title: 'Inventory Sheet', href: '/reports/inventory-sheet' },
        ]}
        >
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-semibold">Inventory Sheet Report</h1>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
            <select value={data.building_id} onChange={(e) => setData('building_id', e.target.value)}>
                <option value="">Select Building</option>
                {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                    {b.name}
                </option>
                ))}
            </select>

            <select
                value={data.unit_or_department_id}
                onChange={(e) => setData('unit_or_department_id', e.target.value)}
            >
                <option value="">Select Department</option>
                {departments.map((d) => (
                <option key={d.id} value={d.id}>
                    {d.name}
                </option>
                ))}
            </select>

            <select value={data.building_room_id} onChange={(e) => setData('building_room_id', e.target.value)}>
                <option value="">Select Room</option>
                {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                    {r.room}
                </option>
                ))}
            </select>

            <select value={data.sub_area_id} onChange={(e) => setData('sub_area_id', e.target.value)}>
                <option value="">Select Sub-Area</option>
                {subAreas.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.name}
                </option>
                ))}
            </select>
            </div>

            <Button onClick={generateReport} disabled={processing} className="cursor-pointer">
            Generate Report
            </Button>

            {/* Report Table */}
            <div className="overflow-x-auto mt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sub-Area</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Remarks</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {report.length > 0 ? (
                    report.map((a) => (
                    <TableRow key={a.id}>
                        <TableCell>{a.asset_name}</TableCell>
                        <TableCell>{a.asset_type}</TableCell>
                        <TableCell>{a.sub_area ?? '—'}</TableCell>
                        <TableCell>{a.quantity}</TableCell>
                        <TableCell>{a.remarks}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        No data.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </div>
        </AppLayout>
    );
}
