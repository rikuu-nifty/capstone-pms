@php
use Carbon\Carbon;

/* ------- Format Filters ------- */
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$dateAssigned = '—';
if ($fromDate && $toDate) $dateAssigned = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $dateAssigned = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $dateAssigned = 'Until ' . $toDate->format('F d, Y');

/* ------- Group by Unit / Department if no filter ------- */
$grouped = null;
if (empty($filters['department_id'])) {
$grouped = collect($records)->groupBy(fn($r) => $r->asset_unit_or_department ?? '—');
}
@endphp

{{-- ================= HEADER ================= --}}
<tr>
    <td colspan="7" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>

<tr>
    <td colspan="7"></td>
</tr> {{-- spacer --}}

{{-- Report Details --}}
<tr>
    <td style="font-weight:bold;">Report Title:</td>
    <td colspan="3">Personnel Assignments Detailed Report</td>
    <td style="font-weight:bold;">Unit / Department:</td>
    <td colspan="2">{{ $filters['department_name'] ?? '—' }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Personnel Status:</td>
    <td colspan="3">{{ $filters['status_label'] ?? '—' }}</td>
    <td style="font-weight:bold;">Date Assigned:</td>
    <td colspan="2">{{ $dateAssigned }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Date Generated:</td>
    <td colspan="6">{{ now()->format('F d, Y') }}</td>
</tr>

<tr>
    <td colspan="7"></td>
</tr> {{-- spacer --}}

{{-- ================= MAIN TABLE ================= --}}
<table>
    <thead>
        <tr>
            <th>CODE NO.</th>
            <th>ASSET NAME</th>
            <th>UNIT / DEPARTMENT</th>
            <th>PREVIOUSLY ASSIGNED TO</th>
            <th>PERSONNEL-IN-CHARGE</th>
            <th>DATE ASSIGNED</th>
            <th>STATUS</th>
        </tr>
    </thead>
    <tbody>
        @if ($grouped)
        @foreach ($grouped as $dept => $rows)
        <tr>
            <td colspan="7" style="font-weight:bold; color:#053eb9; background:#dfdede; padding-left:40px; text-align:left;">
                Unit / Department: {{ $dept ?? '—' }}
            </td>
        </tr>

        @foreach ($rows as $r)
        <tr>
            <td>{{ $r->equipment_code ?? '—' }}</td>
            <td>
                {{ $r->asset_name ?? '—' }}
                @if(!empty($r->category)) ({{ $r->category }}) @endif
                @if(!empty($r->serial_no))
                {{ "\nSN: {$r->serial_no}" }}
                @endif
            </td>
            <td>{{ $r->asset_unit_or_department ?? '—' }}</td>
            <td style="color:#dc2626;">{{ $r->previous_personnel_name ?? '—' }}</td>
            <td style="font-weight:bold;">{{ $r->personnel_name ?? '—' }}</td>
            <td>{{ $r->date_assigned ? Carbon::parse($r->date_assigned)->format('M d, Y') : '—' }}</td>

            <td>
                @php
                $statuses = [];
                if (!empty($r->asset_status)) {
                $statuses[] = ucwords(str_replace('_', ' ', $r->asset_status));
                }
                if ($r->current_inventory_status)
                $statuses[] = "Inventory: " . ucwords(str_replace('_',' ', $r->current_inventory_status));
                if ($r->current_transfer_status)
                $statuses[] = "Transfer: " . ucwords(str_replace('_',' ', $r->current_transfer_status));
                if ($r->current_turnover_disposal_status)
                $statuses[] = "Turnover/Disposal: " . ucwords(str_replace('_',' ', $r->current_turnover_disposal_status));
                if ($r->current_off_campus_status)
                $statuses[] = "Off-Campus: " . ucwords(str_replace('_',' ', $r->current_off_campus_status));
                if (empty($statuses))
                $statuses[] = "No recent activity";
                @endphp
                {!! implode("\n", $statuses) !!}
            </td>
        </tr>
        @endforeach
        @endforeach
        @else
        @forelse ($records as $r)
        <tr>
            <td>{{ $r->equipment_code ?? '—' }}</td>
            <td>
                {{ $r->asset_name ?? '—' }}
                @if(!empty($r->category)) ({{ $r->category }}) @endif
                @if(!empty($r->serial_no))
                {{ "\nSN: {$r->serial_no}" }}
                @endif
            </td>
            <td>{{ $r->asset_unit_or_department ?? '—' }}</td>
            <td style="color:#dc2626;">{{ $r->previous_personnel_name ?? '—' }}</td>
            <td style="font-weight:bold;">{{ $r->personnel_name ?? '—' }}</td>
            <td>{{ $r->date_assigned ? Carbon::parse($r->date_assigned)->format('M d, Y') : '—' }}</td>

            <td>
                @php
                $statuses = [];
                if (!empty($r->asset_status)) {
                $statuses[] = ucwords(str_replace('_', ' ', $r->asset_status));
                }
                if ($r->current_inventory_status)
                $statuses[] = "Inventory: " . ucwords(str_replace('_',' ', $r->current_inventory_status));
                if ($r->current_transfer_status)
                $statuses[] = "Transfer: " . ucwords(str_replace('_',' ', $r->current_transfer_status));
                if ($r->current_turnover_disposal_status)
                $statuses[] = "Turnover/Disposal: " . ucwords(str_replace('_',' ', $r->current_turnover_disposal_status));
                if ($r->current_off_campus_status)
                $statuses[] = "Off-Campus: " . ucwords(str_replace('_',' ', $r->current_off_campus_status));
                if (empty($statuses))
                $statuses[] = "No recent activity";
                @endphp
                {!! implode("\n", $statuses) !!}
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="7" style="text-align:center; padding:10px;">No data available.</td>
        </tr>
        @endforelse
        @endif
    </tbody>
</table>