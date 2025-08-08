import React from 'react';
import { Transfer, InventoryList, User } from '@/types';

interface TransferViewProps {
    transfer: Transfer;
    assets: InventoryList[];
    // assigned_by: User;
}

export default function TransferView({ 
    transfer, 
    assets, 
//    assigned_by, 
}: TransferViewProps) {
    
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto border border-gray-300">
            <div className="flex justify-between items-start">
                <div>
                    <img src="/logo.png" alt="Logo" className="h-10 mb-2" />
                    <p className="text-sm text-gray-700 font-medium">Transfer From: {transfer.currentBuildingRoom?.building?.name}</p>
                    <p className="text-sm text-gray-700 font-medium">Transfer To: {transfer.receivingOrganization?.code}</p>
                    <p className="text-sm text-gray-700 font-medium">Room: {transfer.receivingBuildingRoom?.room}</p>
                    <p className="text-sm text-gray-700 font-medium">Current Room: {transfer.currentBuildingRoom?.room}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-bold">InnoTech Inc.</h2>
                    <p className="text-sm">innotech.keebspot@gmail.com</p>
                    <p className="text-sm">+63 973 234 3456</p>
                    <p className="text-sm">ID:{transfer.id.toString().padStart(2, '0')}</p>
                </div>
            </div>

            <div className="flex justify-between mt-4 mb-2">
                <p className="text-sm font-medium">Date Transfer: {transfer.scheduled_date}</p>
                <p className="text-sm font-medium">Total of Transfer: {assets.length}</p>
            </div>

            <table className="w-full border mt-2 text-sm">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        <th className="border px-2 py-1 text-left">Asset Name</th>
                        <th className="border px-2 py-1 text-left">Brand</th>
                        <th className="border px-2 py-1 text-left">Category</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                        <td className="border px-2 py-1">{asset.asset_name}</td>
                        {/* <td className="border px-2 py-1">{asset.brand}</td> */}
                        <td className="border px-2 py-1">{asset.asset_type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6">
                <p className="text-sm font-semibold">Prepared by:</p>
                {/* <p className="text-sm">{assigned_by.name}</p> */}
                <p className="text-xs text-gray-500">PMO Staff</p>
            </div>

        {/* <div className="mt-4">
            <p className="text-sm font-semibold">Approved by:</p>
            <p className="text-sm">{approvedBy.name}</p>
            <p className="text-xs text-gray-500">PMO Head</p>
        </div> */}

            <div className="mt-6 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-gray-200 px-4 py-2 rounded shadow text-sm font-semibold hover:bg-gray-300"
                >
                    🖨️ Print Form
                </button>
            </div>
        </div>
    );
}
