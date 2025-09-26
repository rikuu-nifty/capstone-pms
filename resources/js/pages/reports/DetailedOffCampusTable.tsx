import { useState } from 'react'

// ✅ Centralized status label mapping
export const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  pending_return: 'Pending Return',
  returned: 'Returned',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  missing: 'Missing',
}

// ✅ Centralized remarks label mapping
export const REMARKS_LABELS: Record<string, string> = {
  official_use: 'Official Use',
  repair: 'Repair',
}

type OffCampus = {
  id: number
  requester_name: string
  department: string | null
  purpose: string
  date_issued: string
  return_date: string | null
  status: string
  quantity: number
  units: string
  remarks: string | null
  approved_by: string | null
}

type Props = { records: OffCampus[] }

export default function DetailedOffCampusTable({ records }: Props) {
  const [page, setPage] = useState(1)
  const rowsPerPage = 8
  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage))
  const startIndex = (page - 1) * rowsPerPage
  const currentRows = records.slice(startIndex, startIndex + rowsPerPage)

  if (records.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
        <p className="text-lg font-semibold">No Data Available</p>
        <p className="text-sm">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-800">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Requester Name</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Date Issued</th>
              <th className="px-4 py-3 font-semibold">Return Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Quantity</th>
              <th className="px-4 py-3 font-semibold">Units</th>
              <th className="px-4 py-3 font-semibold">Remarks</th>
              <th className="px-4 py-3 font-semibold">Approved By</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((r, idx) => (
              <tr
                key={r.id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t`}
              >
                <td className="px-4 py-3">{startIndex + idx + 1}</td>
                <td className="px-4 py-3">{r.requester_name}</td>
                <td className="px-4 py-3">{r.department ?? '—'}</td>
                <td className="px-4 py-3">{r.purpose}</td>
                <td className="px-4 py-3">
                  {r.date_issued
                    ? new Date(r.date_issued).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {r.return_date
                    ? new Date(r.return_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>

                {/* ✅ Status with badge */}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === 'returned'
                        ? 'bg-green-100 text-green-700'
                        : r.status === 'pending_return'
                        ? 'bg-blue-100 text-blue-700'
                        : r.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-700'
                        : r.status === 'overdue'
                        ? 'bg-[#800000]/10 text-[#800000]' // maroon
                        : r.status === 'cancelled'
                        ? 'bg-red-100 text-red-600'
                        : r.status === 'missing'
                        ? 'bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>

                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3">{r.units}</td>

                {/* ✅ Remarks with label mapping */}
                <td className="px-4 py-3">
                  {r.remarks ? REMARKS_LABELS[r.remarks] ?? r.remarks : '—'}
                </td>

                <td className="px-4 py-3">{r.approved_by ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`rounded-md px-4 py-2 ${
              page === 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`rounded-md px-4 py-2 ${
              page === totalPages
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
