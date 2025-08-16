import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import type { CategoryWithModels } from '@/types/category';
// import { formatStatusLabel } from '@/types/custom-index';

interface  CategoryViewProps {
    open: boolean;
    onClose: () => void;
    category: CategoryWithModels;
};

export default function CategoryViewModal({ 
    open, 
    onClose, 
    category 
}: CategoryViewProps ) {

    // const recordNo = String(category.id).padStart(2, '0');
    const models = category.asset_models ?? [];

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
                    <img src="https://www.auf.edu.ph/home/images/mascot/GEN.png" alt="Logo" className="h-25 opacity-90"/>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h2 className="text-2xl font-bold tracking-wide uppercase print:text-lg">
                        Property Management Office
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">pmo@auf.edu.ph</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">+63 973 234 3456</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                {/* LEFT: Model Details */}
                <section>
                    <h3 className="mb-2 text-base font-semibold">Details</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">Category ID</td>
                                    <td className="px-3 py-2 font-medium">{category.id}</td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">Category Name</td>
                                    <td className="px-3 py-2 font-medium">{category.name ?? '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* RIGHT: Utilization */}
                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Utilization</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 md:ml-auto md:w-[250px]">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-2/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Distinct Brands
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right md:text-right">
                                        {category.brands_count ?? 0}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-2/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Associated Models
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right md:text-right">
                                        {category.models_count ?? 0}
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
                        <th className="px-3 py-2 text-center font-medium">Total Asset Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((m) => (
                            <tr key={m.id} className="border-t">
                                <td className="px-3 py-2">{m.brand ?? '—'}</td>
                                <td className="px-3 py-2">{m.model ?? '—'}</td>
                                <td className="px-3 py-2">{typeof m.assets_count === 'number' ? m.assets_count : '0'}</td>
                            </tr>
                        ))}
                        {!models.length && (
                        <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                                No asset models in this category.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* <div className="h-2" /> */}

            <div className="grid grid-cols-2 items-start gap-4 mb-1 mt-1">
                <div>
                    <h4 className="mt-2 text-sm font-semibold text-gray-800">Description:</h4>
                    {category.description && (
                    <p className="text-sm italic text-blue-700 mt-2 w-200 ml-15">
                        {category.description.trim()}
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
                    ← Back to Categories
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
