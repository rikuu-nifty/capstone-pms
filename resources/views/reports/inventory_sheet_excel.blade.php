<table>
    <thead>
        <tr>
            <th>#</th>
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
            <td>{{ $i + 1 }}</td>
            <td>{{ $a['memorandum_no'] ?? '—' }}</td>
            <td>{{ $a['asset_name'] }} ({{ $a['asset_type'] }})</td>
            <td>{{ $a['serial_no'] ?? '—' }}</td>
            <td>{{ $a['unit_cost'] }}</td>
            <td>{{ $a['supplier'] ?? '—' }}</td>
            <td>{{ $a['date_purchased'] }}</td>
            <td>1</td>
            <td>{{ $a['quantity'] }}</td>
            <td>{{ ucfirst($a['inventory_status']) }}</td>
            <td>{{ $a['inventoried_at'] ?? '—' }}</td>
            <td>{{ $a['status'] }}</td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
</table>