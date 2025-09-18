type Props = {
    assets: {
        id: number
        asset_name: string
        asset_type: string
        sub_area: string | null
        quantity: number
        status: string
        inventory_status: string
    }[]
}

export default function InventorySheetTable({ assets }: Props) {
    return (
        <div className="overflow-y-auto h-full">
        <table className="w-full text-sm border">
            <thead className="bg-gray-100 text-gray-700">
            <tr>
                <th className="px-3 py-2 text-left">Asset Name</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Sub-Area</th>
                <th className="px-3 py-2 text-center">Quantity</th>
                <th className="px-3 py-2 text-left">Status / Remarks</th>
                <th className="px-3 py-2 text-left">Inventory Status</th>
            </tr>
            </thead>
            <tbody>
            {assets.map((a) => (
                <tr key={a.id} className="border-t">
                <td className="px-3 py-2">{a.asset_name}</td>
                <td className="px-3 py-2">{a.asset_type}</td>
                <td className="px-3 py-2">{a.sub_area ?? '—'}</td>
                <td className="px-3 py-2 text-center">{a.quantity}</td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2">{a.inventory_status}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    )
}
