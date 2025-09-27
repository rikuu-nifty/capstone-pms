import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import type { EquipmentCodeWithModels } from '@/types/equipment-code';

interface EquipmentCodeViewProps {
    open: boolean;
    onClose: () => void;
    equipmentCode: EquipmentCodeWithModels;
};

export default function ViewEquipmentCodeModal({ 
    open, 
    onClose, 
    equipmentCode 
}: EquipmentCodeViewProps) {
    const models = equipmentCode.asset_models ?? [];

    return (
        <ViewModal
            open={open}
            onClose={onClose}
            size="xl"
            contentClassName="relative max-h-[80vh] overflow-y-auto print:overflow-x-hidden"
        >
            {/* Header */}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>
            </div>

            {/* Two columns (equal height/width) */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                {/* LEFT: Details */}
                <section className="flex flex-col">
                <h3 className="mb-2 text-base font-semibold">Details</h3>
                <div className="h-full overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-sm">
                    <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                        {/* fixed width for label cell */}
                        <td className="w-48 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                            Code
                        </td>
                        <td className="px-3 py-2 font-medium text-right md:text-right">
                            {equipmentCode.code.toUpperCase()}
                        </td>
                        </tr>
                        <tr>
                        <td className="w-48 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                            Category
                        </td>
                        <td className="px-3 py-2 font-medium text-right md:text-right">
                            {equipmentCode.category_name ?? '—'}
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </section>

                {/* RIGHT: Utilization */}
                <section className="flex flex-col md:text-right print:justify-self-end print:text-right">
                <h3 className="mb-2 text-base font-semibold">Utilization</h3>
                <div className="h-full overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-sm">
                    <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                        {/* same fixed width here */}
                        <td className="w-48 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                            Total Associated Models
                        </td>
                        <td className="px-3 py-2 font-semibold text-right md:text-right">
                            {equipmentCode.asset_models_count ?? 0}
                        </td>
                        </tr>
                        <tr>
                        <td className="w-48 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                            Total Linked Assets
                        </td>
                        <td className="px-3 py-2 font-semibold text-right md:text-right">
                            {equipmentCode.assets_count ?? 0}
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </section>
            </div>

            {/* Asset Models Table */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-center font-medium">Brand</th>
                            <th className="px-3 py-2 text-center font-medium">Model</th>
                            <th className="px-3 py-2 text-center font-medium">Assets Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((m) => (
                            <tr key={m.id} className="border-t">
                                <td className="px-3 py-2">{m.brand ?? '—'}</td>
                                <td className="px-3 py-2">{m.model ?? '—'}</td>
                                <td className="px-3 py-2">
                                    {typeof m.assets_count === 'number' ? m.assets_count : 0}
                                </td>
                            </tr>
                        ))}
                        {!models.length && (
                            <tr>
                                <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                    No asset models linked to this code.
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
                    {equipmentCode.description && (
                        <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">
                            {equipmentCode.description.trim()}
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
                    ← Back to Codes
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
