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
        @foreach ($assets as $groupKey => $items)
        @php
        [$type, $label] = explode(':', $groupKey, 2) + [null, null];

        if ($type) {
        $type = preg_replace('/([a-z])([A-Z])/', '$1 $2', $type);
        $type = preg_replace('/[_-]+/', ' ', $type);
        $type = ucwords(strtolower($type));
        }

        if ($label) {
        $label = preg_replace('/([a-z])([A-Z])/', '$1 $2', $label);
        $label = preg_replace('/[_-]+/', ' ', $label);
        $label = ucwords(strtolower($label));
        }
        @endphp

        @if ($type && $label)
        <tr>
            <td colspan="11" style="font-weight:bold; background:#eaeaea;">
                {{ $type }}: {{ $label }}
            </td>
        </tr>
        @endif

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
            <td>{{ $a['inventoried_at'] ?? '—' }}</td>
            <td>{{ $a['status'] }}</td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
    <tfoot>
        @php
        $totalAssets = $assets->map->count()->sum();
        $totalCost = $assets->map(function ($group) {
        return collect($group)->sum(fn($a) => (float) ($a['unit_cost'] ?? 0));
        })->sum();
        @endphp
        <tr>
            <td colspan="11" style="font-weight:bold; text-align:left;">
                Total Assets: {{ number_format($totalAssets) }}
                &nbsp; | &nbsp;
                Total Cost: ₱{{ number_format($totalCost, 2) }}
            </td>
        </tr>
    </tfoot>
</table>