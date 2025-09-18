@extends('reports.layout')

@section('title', 'Inventory Sheet Report')

@section('content')
@php
use Carbon\Carbon;

$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;

$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

// Determine year or range
if ($fromDate && $toDate) {
$reportYear = $fromDate->year === $toDate->year
? $fromDate->year
: $fromDate->year . ' - ' . $toDate->year;
} elseif ($fromDate) {
$reportYear = $fromDate->year;
} elseif ($toDate) {
$reportYear = $toDate->year;
} else {
$reportYear = now()->year . '-' . (now()->year + 1);
}
@endphp

<div style="text-align:center; margin-bottom:20px;">
    <h3 style="margin:0; font-weight:bold;">
        Inventory Sheet Report {{ $reportYear }}
    </h3>
</div>

<div style="border-top: 2px solid #000; margin: 15px 0;"></div>

{{-- Filters summary --}}
<div class="mb-6">
    <h3 style="color:#000;">Filters</h3>
    @php $f = $filters ?? []; @endphp
    @if (collect($f)->filter()->isEmpty())
    <span class="muted">No Filters Applied – showing all available records.</span>
    @else
    @foreach ([
    'from' => 'From',
    'to' => 'To',
    'building_id' => 'Building',
    'department_id' => 'Department',
    'room_id' => 'Room',
    'sub_area_id' => 'Sub-Area',
    ] as $key => $label)
    @if (!empty($f[$key]))
    @if (in_array($key, ['from','to']))
    <span class="pill mr-2">{{ $label }}: {{ Carbon::parse($f[$key])->format('M d, Y') }}</span>
    @else
    <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
    @endif
    @endif
    @endforeach
    @endif
</div>

{{-- Totals --}}
<div class="mb-6 totals">
    <strong>Total Assets:</strong> {{ $assets->flatten()->count() }}
    {{-- Optional: add total cost --}}
    @php
    $totalCost = $assets->flatten()->sum(fn($a) => (float) ($a['unit_cost'] ?? 0));
    @endphp
    &nbsp; | &nbsp; <strong>Total Cost:</strong> ₱{{ number_format($totalCost, 2) }}
</div>

{{-- Table --}}
<table width="100%" cellspacing="0" cellpadding="5" border="1" style="border-collapse:collapse; font-size:12px;">
    <thead>
        <tr style="background:#f0f0f0; font-weight:bold; text-align:center;">
            <th style="width:36px;">#</th>
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
        {{-- Sub-Area header row --}}
        <tr>
            <td colspan="12" style="font-weight:bold; background:#eaeaea;">
                Sub-Area: {{ $subArea ?? 'No Sub-Area' }}
            </td>
        </tr>
        @foreach ($items as $i => $a)
        <tr style="text-align:center;">
            <td>{{ $i + 1 }}</td>
            <td>{{ $a['memorandum_no'] ?? '—' }}</td>
            <td>
                <div>
                    <strong>{{ $a['asset_name'] }}</strong><br />
                    <small>{{ $a['asset_type'] }}</small>
                </div>
            </td>
            <td>{{ $a['serial_no'] ?? '—' }}</td>
            <td>{{ $a['unit_cost'] ? number_format($a['unit_cost'], 2) : '—' }}</td>
            <td>{{ $a['supplier'] ?? '—' }}</td>
            <td>{{ $a['date_purchased'] ? Carbon::parse($a['date_purchased'])->format('M d, Y') : '—' }}</td>
            <td>1</td>
            <td>{{ $a['quantity'] }}</td>
            <td>{{ ucfirst($a['inventory_status']) }}</td>
            <td>{{ $a['inventoried_at'] ? Carbon::parse($a['inventoried_at'])->format('M d, Y') : '—' }}</td>
            <td>{{ $a['status'] }}</td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
</table>
@endsection