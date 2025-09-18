<table>
    <thead>
        <tr>
            <th colspan="12">
                Date Basis: {{ ucfirst($filters['date_basis'] ?? 'Inventoried') }}
            </th>
        </tr>
        <tr>
            <!-- <th>#</th> -->
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
        @foreach ($assets as $subArea => $items)
        <tr>
            <td colspan="12">Sub-Area: {{ $subArea ?? 'No Sub-Area' }}</td>
        </tr>
        @foreach ($items as $i => $a)
        <tr>
            <!-- <td>{{ $i + 1 }}</td> -->
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
            <td colspan="12" style="font-weight:bold; text-align:left;">
                Total Assets: {{ number_format($totalAssets) }}
                &nbsp; | &nbsp;
                Total Cost: ₱{{ number_format($totalCost, 2) }}
            </td>
        </tr>
    </tfoot>
</table>