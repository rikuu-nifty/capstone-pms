<table>
    <thead>
        <tr>
            <th>MR No.</th>
            <th>Asset Name (Type)</th>
            <th>Serial No.</th>
            <th>Price</th>
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
            <td>{{ $a['unit_cost'] }}</td>
            <td>{{ $a['supplier'] ?? '—' }}</td>
            <td>{{ $a['date_purchased'] }}</td>
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
            <td>
                @if (!empty($a['inventoried_at']))
                {{ \Carbon\Carbon::parse($a['inventoried_at'])->format('F j, Y g:i:s A') }}
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