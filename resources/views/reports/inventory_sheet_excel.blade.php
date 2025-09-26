@php
use Carbon\Carbon;

// Default blank values
$first = [
'department' => null,
'sub_area' => null,
'building' => null,
'assigned_to' => null,
'room' => null,
'inventoried_at'=> null,
];

// Fill if filters exist
if (!empty($filters['department_id'])) {
$first['department'] = optional(\App\Models\UnitOrDepartment::find($filters['department_id']))->name;
}
if (!empty($filters['building_id'])) {
$first['building'] = optional(\App\Models\Building::find($filters['building_id']))->name;
}
if (!empty($filters['room_id'])) {
$first['room'] = optional(\App\Models\BuildingRoom::find($filters['room_id']))->room;
}
if (!empty($filters['sub_area_id'])) {
$first['sub_area'] = optional(\App\Models\SubArea::find($filters['sub_area_id']))->name;
}

// Date of Count
$fromDate = !empty($filters['from']) ? Carbon::parse($filters['from']) : null;
$toDate = !empty($filters['to']) ? Carbon::parse($filters['to']) : null;

if ($fromDate && $toDate) {
$first['inventoried_at'] = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
} elseif ($fromDate) {
$first['inventoried_at'] = $fromDate->format('F d, Y') . ' – Present';
} elseif ($toDate) {
$first['inventoried_at'] = 'Until ' . $toDate->format('F d, Y');
}
@endphp

{{-- Report Title --}}
<tr>
    <td colspan="11" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>
<tr>
    <td colspan="11"></td>
</tr> {{-- spacer row --}}

{{-- Report Details --}}
<tr>
    <td style="font-weight:bold;">College/Unit:</td>
    <td colspan="4">{{ $first['department'] ?? '—' }}</td>
    <td style="font-weight:bold;">Section (Sub-Area):</td>
    <td colspan="5">{{ $first['sub_area'] ?? '—' }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Building:</td>
    <td colspan="4">{{ $first['building'] ?? '—' }}</td>
    <td style="font-weight:bold;">Personnel-in-Charge:</td>
    <td colspan="5">{{ $first['assigned_to'] ?? '—' }}</td>
</tr>
<tr>
    <td style="font-weight:bold;">Room:</td>
    <td colspan="4">{{ $first['room'] ?? '—' }}</td>
    <td style="font-weight:bold;">Date of Count:</td>
    <td colspan="5">{{ $first['inventoried_at'] ?? '—' }}</td>
</tr>

<tr>
    <td colspan="11"></td>
</tr> {{-- spacer row --}}


<table>
    <thead>
        <tr>
            <th>MR No.</th>
            <th>Asset Name (Type)</th>
            <th>Serial No.</th>
            <th>Unit Cost</th>
            <th>Supplier</th>
            <th>Date Purchased</th>
            <th>Per Record</th>
            <th>Actual</th>
            <th>Inventory Status</th>
            <th>Date of Count</th>
            <th>Remarks</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($assets as $roomKey => $subGroups)
        {{-- Room header --}}
        @php [, $roomLabel] = explode(':', $roomKey, 2) + [null, null]; @endphp
        <tr>
            <td colspan="11" style="font-weight:bold; background:#eaeaea; text-align:center;">
                Room: {{ $roomLabel ?? '—' }}
            </td>
        </tr>

        {{-- Sub-groups: sub-area, memo, no_sub_area --}}
        @foreach ($subGroups as $subKey => $items)
        @php [, $subLabel] = explode(':', $subKey, 2) + [null, null]; @endphp

        @if ($subKey === 'no_sub_area')
        <tr>
            <td colspan="11" style="font-weight:bold; background:#f5f5f5; text-align:center;">
                Others (No Sub Area or Shared Memorandum No.):
            </td>
        </tr>
        @else
        <tr>
            <td colspan="11" style="font-weight:bold; background:#f5f5f5; text-align:center;">
                {{ ucwords(str_replace('_', ' ', strtok($subKey, ':'))) }}: {{ $subLabel }}
            </td>
        </tr>
        @endif

        {{-- Assets inside each sub-group --}}
        @foreach ($items as $a)
        <tr>
            <td>{{ $a['memorandum_no'] ?? '—' }}</td>
            <td>{{ $a['asset_name'] }} ({{ $a['asset_type'] }})</td>
            <td>{{ $a['serial_no'] ?? '—' }}</td>

            {{-- Unit Cost formatted --}}
            <td>
                {{ isset($a['unit_cost']) ? '₱ ' . number_format((float)$a['unit_cost'], 2) : '—' }}
            </td>

            <td>{{ $a['supplier'] ?? '—' }}</td>

            {{-- Date Purchased formatted --}}
            <td>
                @if (!empty($a['date_purchased']))
                {{ \Carbon\Carbon::parse($a['date_purchased'])->format('M d, Y') }}
                @else
                —
                @endif
            </td>

            <td>1</td>
            <td>{{ $a['quantity'] }}</td>

            <td>
                @php
                $val = $a['inventory_status'] ?? '—';
                if ($val) {
                $val = preg_replace('/([a-z])([A-Z])/', '$1 $2', $val);
                $val = preg_replace('/[_-]+/', ' ', $val);
                $val = ucwords(strtolower($val));
                }
                @endphp
                {{ $val ?: '—' }}
            </td>

            {{-- Date of Count formatted --}}
            <td>
                @if (!empty($a['inventoried_at']))
                {{ \Carbon\Carbon::parse($a['inventoried_at'])->format('M d, Y') }}
                @else
                —
                @endif
            </td>

            <td>{{ $a['status'] }}</td>
        </tr>
        @endforeach
        @endforeach
        @endforeach
    </tbody>

    <tfoot>
        @php
        $totalAssets = 0;
        $totalCost = 0.0;

        foreach ($assets as $roomGroups) {
        foreach ($roomGroups as $subGroup) {
        foreach ($subGroup as $a) {
        $totalAssets++;
        $totalCost += (float) ($a['unit_cost'] ?? 0);
        }
        }
        }
        @endphp
        <tr>
            <td colspan="11" style="font-weight:bold; text-align:right; border-top:2px solid #000; vertical-align:middle;">
                Total Assets: {{ number_format($totalAssets) }}
            </td>
        </tr>
        <tr>
            <td colspan="11" style="font-weight:bold; text-align:right; border-bottom:2px solid #000; vertical-align:middle;">
                Total Cost: ₱{{ number_format($totalCost, 2) }}
            </td>
        </tr>
    </tfoot>
</table>