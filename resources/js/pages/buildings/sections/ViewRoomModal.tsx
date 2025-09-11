import { Button } from '@/components/ui/button';
import ViewModal from '@/components/modals/ViewModal';
import { RoomWithAssets } from '@/types/building-room';
import { formatLabel } from '@/types/custom-index';

interface Props {
    open: boolean;
    onClose: () => void;
    room: RoomWithAssets;
}

export default function ViewRoomModal({ 
    open, 
    onClose, 
    room 
}: Props) {
    const assets = room.assets ?? [];
    const assetCount =  typeof room.assets_count === 'number' ? room.assets_count : assets.length;

    const subAreas = room.sub_areas ?? [];
    const subAreaCount = subAreas.length;

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
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                        pmo@auf.edu.ph
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs">
                        +63 973 234 3456
                    </p>
                </div>
            </div>

            {/* Summary panels */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-12 print:grid-cols-2">
                {/* LEFT: Room Details */}
                <section>
                    <h3 className="mb-2 text-base font-semibold">Room Details</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-1/3 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Room ID
                                    </td>
                                    <td className="px-3 py-2 font-medium">{room.id}</td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Room Name/No.
                                    </td>
                                    <td className="px-3 py-2 font-medium">{room.room ?? '—'}</td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Building Code
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {room.building?.code ?? '—'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* RIGHT: Utilization */}
                <section className="md:text-right print:justify-self-end print:text-right">
                    <h3 className="mb-2 text-base font-semibold">Utilization</h3>
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 md:ml-auto md:w-[280px]">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-3/4 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Asset Count
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right">
                                        {assetCount.toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-3/4 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Total Sub-Area
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right">
                                        {subAreaCount.toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="w-3/4 bg-gray-100 px-3 py-2 text-gray-700 dark:bg-neutral-900">
                                        Institution Asset Share
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-right">
                                        {(room.asset_share ?? 0).toFixed(2)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Description */}
            {room.description && room.description.trim().length > 0 && (
                <div className="grid grid-cols-2 items-start gap-4 mb-1 mt-4">
                    <div>
                        <h4 className="mt-2 text-sm font-semibold text-gray-800">Description:</h4>
                        <p className="text-sm italic text-blue-700 mt-2">
                            {room.description.trim()}
                        </p>
                    </div>
                </div>
            )}

            {/* Sub Areas Table */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <h3 className="bg-blue-100 px-3 py-2 text-sm font-semibold text-left">
                    SUB AREAS
                </h3>
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subAreas.length > 0 ? (
                            subAreas.map((sa) => (
                                <tr key={sa.id} className="border-t">
                                    <td className="px-3 py-2">{sa.id}</td>
                                    <td className="px-3 py-2">{sa.name}</td>
                                    <td className="px-3 py-2">{sa.description ?? '—'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                    No sub areas assigned to this room.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assets Table */}
            <div className="mt-6 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                <h3 className="bg-blue-100 px-3 py-2 text-sm font-semibold text-left">
                    ASSETS
                </h3>
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Asset Name</th>
                            <th className="px-3 py-2">Serial No.</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2">Sub Area</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.length > 0 ? ( assets.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2">{a.id}</td>
                                    <td className="px-3 py-2">{formatLabel(a.asset_name ?? '—')}</td>
                                    <td className="px-3 py-2">{a.serial_no ?? '—'}</td>
                                    <td className="px-3 py-2">{a.asset_model?.category?.name ?? '—'}</td>
                                    <td className="px-3 py-2">{a.sub_area?.name ?? '—'}</td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                                    No assets found in this room.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="text-center print:hidden mt-6">
                <a
                    onClick={onClose}
                    className="cursor-pointer inline-block bg-black text-white px-4 py-2 mr-2 rounded shadow text-sm font-semibold hover:bg-black/70"
                >
                    ← Back to Buildings
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