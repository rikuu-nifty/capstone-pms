import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import type { UnitOrDepartment } from '@/types/unit-or-department';
import { formatLabel } from '@/types/custom-index';

interface Props {
  open: boolean;
  onClose: () => void;
  record: UnitOrDepartment;
}

export default function ViewUnitOrDepartmentModal({
  open,
  onClose,
  record,
}: Props) {
    const assets = record.inventory_lists ?? [];
    const assetsCount = record.assets_count ?? 0;

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden"
        >
            <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                <img
                    src="https://www.auf.edu.ph/home/images/mascot/GEN.png"
                    alt="Logo"
                    className="h-25 opacity-90"
                />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">
                    Property Management Office
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                    pmo@auf.edu.ph
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                    +63 973 234 3456
                </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                <section>
                    <h3 className="mb-2 text-base font-semibold">Details</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        ID
                                    </td>
                                    <td className="px-3 py-2 font-medium">{record.id}</td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Unit/Lab/Dept
                                    </td>
                                    <td className="px-3 py-2 font-medium">{record.name ?? '—'} ({record.code ?? '—'})</td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Unit Head
                                    </td>
                                    <td className="px-3 py-2 font-medium">{record.unit_head ?? '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Utilization</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 md:ml-auto md:w-[250px]">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-3/4 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Total Assets
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right md:text-right">
                                        {Number(assetsCount).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Asset Name</th>
                            <th className="px-3 py-2 text-center font-medium">Category</th>
                            <th className="px-3 py-2 text-center font-medium">Serial No.</th>
                            <th className="px-3 py-2 text-center font-medium">Building</th>
                            <th className="px-3 py-2 text-center font-medium">Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.length ? (
                            assets.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2">{formatLabel(a.asset_name ?? '—')}</td>
                                    <td className="px-3 py-2">
                                        {a.asset_model?.category?.name ?? '—'}
                                    </td>
                                    <td className="px-3 py-2">{(a.serial_no ?? '—').toUpperCase()}</td>
                                    <td className="px-3 py-2">
                                        {a.building_room?.building?.code ?? '—'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {a.building_room?.room ?? '—'}
                                    </td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                                    No assets for this unit/department.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 items-start gap-4 mb-1 mt-1">
                <div>
                    <h4 className="mt-2 text-sm font-semibold text-gray-800">Description:</h4>
                    {record.description && (
                        <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">
                        {record.description.trim()}
                        </p>
                    )}
                </div>
            </div>

            <div className="h-4" />

            {/* Actions */}
            <div className="text-center print:hidden mt-6">
                <a
                    onClick={onClose}
                    className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"
                >
                    ← Back to Units / Departments
                </a>
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-semibold hover:bg-blue-500 focus-visible:ring focus-visible:ring-blue-500/50"
                >
                    🖨️ Print Form
                </Button>
            </div>
        </ViewModal>
    );
}
