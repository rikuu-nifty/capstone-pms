@extends('reports.layout')

@section('title', 'Inventory Sheet Report')

@section('content')
@php
use Carbon\Carbon;

$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;

$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

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

<style>
    body {
        font-size: 11px;
    }

    /* 👈 reduced font size */
    table {
        font-size: 11px;
    }

    .signature-block {
        margin-top: 40px;
        width: 100%;
    }

    .signature-block td {
        text-align: center;
        padding: 10px;
        vertical-align: top;
    }

    .acknowledgement {
        margin-top: 30px;
        font-size: 10px;
        text-align: justify;
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
        text-align: right;
    }
</style>

{{-- Title --}}
<div style="text-align:center; margin-bottom:20px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
        Inventory Sheet Report {{ $reportYear }}
    </h3>
</div>

<div style="border-top: 2px solid #000000; margin-top: 20px; margin-bottom: 15px;"></div>

{{-- Filters --}}
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
    <span class="pill mr-2">{{ $label }}:
        {{ Carbon::parse($f[$key])->format('M d, Y') }}
    </span>
    @else
    <span class="pill mr-2">{{ $label }}: {{ $f[$key] }}</span>
    @endif
    @endif
    @endforeach
    @endif

    {{-- Date Basis --}}
    <div class="mt-2">
        <strong>Date Basis:</strong>
        {{ ucfirst($f['date_basis'] ?? 'Inventoried') }}
    </div>
</div>

{{-- Totals --}}
<div class="mb-6 totals">

    @php
    $totalAssets = $assets->map->count()->sum();
    $totalCost = $assets->map(function ($group) {
    return collect($group)->sum(fn($a) => (float) ($a['unit_cost'] ?? 0));
    })->sum();
    @endphp

    <strong>Total Assets:</strong> {{ number_format($totalAssets) }}

    &nbsp; | &nbsp;

    <strong>Total Cost:</strong> ₱ {{ number_format($totalCost, 2) }}
</div>

{{-- Table --}}
<table width="100%" cellspacing="0" cellpadding="5" style="border-collapse:collapse; font-size:12px;">
    <thead>
        {{-- Spacer row for cleaner layout --}}
        <tr class="spacer-row">
            <td colspan="12" style="height:15px; border:none; background:#fff;"></td>
        </tr>
        <tr style="background:#f0f0f0; font-weight:bold; text-align:center;">
            <th style="width:36px; text-align:center">#</th>
            <th style="text-align:center">MR No.</th>
            <th style="text-align:center">Asset Name (Type)</th>
            <th style="text-align:center">Serial No.</th>
            <th style="text-align:center">Price</th>
            <th style="text-align:center">Supplier</th>
            <th style="text-align:center">Date Purchased</th>
            <th style="text-align:center">Per Record</th>
            <th style="text-align:center">Actual</th>
            <th style="text-align:center">Inventory Status</th>
            <th style="text-align:center">Date of Count</th>
            <th style="text-align:center">Remarks</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($assets as $subArea => $items)
        {{-- Sub-Area row --}}
        <tr>
            <td colspan="12" style="font-weight:bold; background:#eaeaea;">
                Sub-Area: {{ $subArea ?? 'No Sub-Area' }}
            </td>
        </tr>
        @foreach ($items as $i => $a)
        <tr style="text-align:center; border-bottom:1px solid #ddd;">
            <td>{{ $i + 1 }}</td>
            <td>{{ $a['memorandum_no'] ?? '—' }}</td>
            <td>
                <div>
                    <strong>{{ $a['asset_name'] }}</strong><br />
                    <small>({{ $a['asset_type'] }})</small>
                </div>
            </td>
            <td>{{ $a['serial_no'] ?? '—' }}</td>
            <td>{{ $a['unit_cost'] ? number_format($a['unit_cost'], 2) : '—' }}</td>
            <td>{{ $a['supplier'] ?? '—' }}</td>
            <td>{{ $a['date_purchased'] ? Carbon::parse($a['date_purchased'])->format('M d, Y') : '—' }}</td>
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
            <td>{{ $a['inventoried_at'] ? Carbon::parse($a['inventoried_at'])->format('M d, Y') : '—' }}</td>
            <td style="white-space:normal; word-wrap:break-word; text-align:center">{{ $a['status'] }}</td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
</table>

{{-- Acknowledgement --}}
<div class="acknowledgement">
    We, the undersigned, acknowledge the custody of the above-mentioned property/ies.
    We also fully agree and understand that we are jointly liable for any damages or losses
    due to mishandling and negligence. It is also understood that we are going to exercise
    proper care in the upkeep and maintenance of the said property/ies to prolong their useful lives. <br><br>
    We are also responsible in informing the Property Management Office regarding any addition,
    movement, transfer and disposal of property/ies under our custody.
</div>

{{-- Additional signatories --}}
<table class="signature-block" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td>
            <div>Personnel-in-Charge</div>
            <br><br>_________________________
        </td>
        <td>
            <div>Immediate Supervisor</div>
            <br><br>_________________________
        </td>
        <td>
            <div>Dean / Head</div>
            <br><br>_________________________
        </td>
    </tr>
</table>

{{-- Footer --}}
<div class="footer">
    Page {PAGE_NUM} of {PAGE_COUNT}
</div>
@endsection