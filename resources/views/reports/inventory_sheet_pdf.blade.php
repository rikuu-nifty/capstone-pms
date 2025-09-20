@extends('reports.layout')

@section('title', 'Inventory Sheet Report')

{{-- Page-specific overrides --}}
@push('styles')
<style>
    body {
        font-size: 11px !important;
    }

    table {
        font-size: 11px !important;
    }

    .acknowledgement {
        margin-top: 50px;
        /* distinct spacing so it won’t overlap */
        font-size: 10px;
        text-align: justify;
    }

    .signature-block {
        margin-top: 40px;
        width: 100%;
        page-break-inside: avoid;
    }

    .signatories-table,
    .signatories-table td,
    .signatories-table th {
        border: none !important;
        background: none !important;
        padding: 8px;
    }

    .signature-block td {
        text-align: center;
        vertical-align: top;
    }

    .footer {
        font-size: 10px;
        text-align: right;
        color: #666;
    }

    .group-room {
        font-weight: bold;
        background: #dadadaff;
        padding-left: 8px;
    }

    .group-sub-area {
        font-style: italic;
        background: #f5f5f5;
        padding-left: 30px;
    }

    .group-memo {
        font-style: italic;
        background: #f5f5f5;
        padding-left: 30px;
    }
</style>
@endpush

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

{{-- Title --}}
<div style="text-align:center; margin-bottom:20px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">
        <!-- Inventory Sheet Report {{ $reportYear }} -->
        Office of the Administrative Services
    </h3>
</div>

<div style="border-top: 2px solid #000; margin: 20px 0;"></div>

{{-- Report Details --}}
@php

// Default blank values for the header
$first = [
'department' => null,
'sub_area' => null,
'building' => null,
'assigned_to' => null, // keep blank until assignment feature
'room' => null,
'inventoried_at' => null,
];

// --- Fill header fields only if that filter was chosen ---

// Department
if (!empty($filters['department_id'])) {
$first['department'] = optional(
\App\Models\UnitOrDepartment::find($filters['department_id'])
)->name;
}

// Building
if (!empty($filters['building_id'])) {
$first['building'] = optional(
\App\Models\Building::find($filters['building_id'])
)->name;
}

// Room
if (!empty($filters['room_id'])) {
$first['room'] = optional(
\App\Models\BuildingRoom::find($filters['room_id'])
)->room;
}

// Sub-Area
if (!empty($filters['sub_area_id'])) {
$first['sub_area'] = optional(
\App\Models\SubArea::find($filters['sub_area_id'])
)->name;
}

// --- Date of Count (use from/to as range over inventoried_at) ---
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;

$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

if ($fromDate && $toDate) {
$first['inventoried_at'] = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
} elseif ($fromDate) {
$first['inventoried_at'] = $fromDate->format('F d, Y') . ' – Present';
} elseif ($toDate) {
$first['inventoried_at'] = 'Until ' . $toDate->format('F d, Y');
}
// If no filters: keep Date of Count as null → display "—"
@endphp

<table width="100%" cellspacing="0" cellpadding="6"
    style="border-collapse: collapse; margin-bottom:20px; font-size:11px; table-layout: fixed;">
    <tr>
        <td style="width:20%; font-weight:bold;">College/Unit:</td>
        <td style="width:30%;">{{ $first['department'] ?? '—' }}</td>
        <td style="width:20%; font-weight:bold;">Section (Sub-Area):</td>
        <td style="width:30%;">{{ $first['sub_area'] ?? '—' }}</td>
    </tr>
    <tr>
        <td style="font-weight:bold;">Building:</td>
        <td>{{ $first['building'] ?? '—' }}</td>
        <td style="font-weight:bold;">Personnel-in-Charge:</td>
        <td>{{ $first['assigned_to'] ?? '—' }}</td>
    </tr>
    <tr>
        <td style="font-weight:bold;">Room:</td>
        <td>{{ $first['room'] ?? '—' }}</td>
        <td style="font-weight:bold;">Date of Count:</td>
        <td>{{ $first['inventoried_at'] ?? '—' }}</td>
    </tr>
</table>


{{-- Table --}}
<table width="100%" cellspacing="0" cellpadding="5" style="border-collapse:collapse;">
    <thead>
        <tr class="spacer-row">
            <td colspan="10" style="height:20px; border:none; background:#fff;"></td>
        </tr>
        <tr>
            <!-- <th style="width:36px; text-align:center">#</th> -->
            <th style="width:38px; text-align:center">MR No.</th>
            <th style="width:120px; text-align:center">Asset Name (Type)</th>
            <th style="width:80px; text-align:center">Serial No.</th>
            <th style="width:80px; text-align:center">Price</th>
            <th style="width:80px; text-align:center">Supplier</th>
            <th style="width:90px; text-align:center">Date Purchased</th>
            <th style="width:10px; text-align:center">Per Record</th>
            <th style="width:10px; text-align:center">Actual</th>
            <th style="width:80px; text-align:center">Inventory Status</th>
            <!-- <th style="width:70px; text-align:center">Date of Count</th> -->
            <th style="text-align:center">Remarks</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($assets as $roomKey => $subGroups)
        {{-- Room header --}}
        @php
        [, $roomLabel] = explode(':', $roomKey, 2) + [null, null];
        @endphp
        <tr>
            <td colspan="10" class="group-room">
                Room: {{ $roomLabel ?? '—' }}
            </td>
        </tr>

        {{-- Loop through sub-groups (sub-area, memo, no_sub_area) --}}
        @foreach ($subGroups as $subKey => $items)
        @php
        [, $subLabel] = explode(':', $subKey, 2) + [null, null];
        @endphp

        @if ($subKey === 'no_sub_area')
        <tr>
            <td colspan="10" class="group-sub-area" style="font-weight:bold;">
                Others (No Sub Area or Shared Memorandum No.):
            </td>
        </tr>
        @else
        <tr>
            <td colspan="10" class="group-{{ str_replace('_', '-', strtok($subKey, ':')) }}">
                {{ ucwords(str_replace('_', ' ', strtok($subKey, ':'))) }}: {{ $subLabel }}
            </td>
        </tr>
        @endif

        {{-- Assets inside sub-group --}}
        @foreach ($items as $a)
        <tr style="text-align:center; border-bottom:1px solid #ddd;">
            <td style="width:38px; text-align:center">{{ $a['memorandum_no'] ?? '—' }}</td>
            <td style="width:120px; text-align:center">
                <div>
                    <strong>{{ $a['asset_name'] }}</strong><br />
                    <small>{{ $a['asset_type'] }}</small>
                </div>
            </td>
            <td style="width:80px; text-align:center">{{ $a['serial_no'] ?? '—' }}</td>
            <td style="width:80px; text-align:center">{{ $a['unit_cost'] ? '₱ ' . number_format($a['unit_cost'], 2) : '—' }}</td>
            <td style="width:80px; text-align:center">{{ $a['supplier'] ?? '—' }}</td>
            <td style="width:90px; text-align:center">{{ $a['date_purchased'] ? \Carbon\Carbon::parse($a['date_purchased'])->format('M d, Y') : '—' }}</td>
            <td style="width:10px; text-align:center">1</td>
            <td style="width:10px; text-align:center">{{ $a['quantity'] }}</td>
            <td style="width:80px; text-align:center">
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
            <td style="white-space:normal; word-wrap:break-word; word-break:break-word; text-align:center; max-width:150px;">
                {{ $a['status'] }}
            </td>
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

        <tr style="font-weight:bold; background:#f9f9f9; border-top:2px solid #000;">
            <td colspan="10" style="text-align:right; padding:8px;">
                Total Assets: {{ number_format($totalAssets) }}
            </td>
        </tr>
        <tr style="font-weight:bold; background:#f9f9f9; border-bottom:2px solid #000;">
            <td colspan="10" style="text-align:right; padding:8px;">
                Total Cost: ₱ {{ number_format($totalCost, 2) }}
            </td>
        </tr>
    </tfoot>

</table>

<div style="page-break-before: always; margin-top:80px;"></div>

{{-- SIGNATORIES – BLOCK 1 --}}
<table class="signatories-table" width="100%" cellspacing="0" cellpadding="8"
    style="margin-top:40px; page-break-inside: avoid; font-size:11px; table-layout:fixed; border:none;">
    <tr>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Prepared by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Property Clerk
        </td>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Verified by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Head, PMO
        </td>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Noted by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Internal Audit
        </td>
    </tr>
</table>

<div style="margin-top:32px; font-size:10px; text-align:justify; page-break-inside: avoid;">
    <p style="text-indent:40px; margin:0 0 12px;">
        We, the undersigned, acknowledge the custody of the above mentioned property/ies.
        We also fully agree and understand that we are jointly liable for any: damages or
        loss/es of the said property/ies due to mishandling and negligence. It is also
        understood that we are going to exercise proper care in the upkeep and maintenance
        of the said property/ies to prolong their useful lives.
    </p>
    <p style="text-indent:40px; margin:0;">
        We are also responsible in informing the Property Management Office regarding any
        addition, movement, transfer and disposal of property/ies under our custody.
    </p>
</div>

{{-- SIGNATORIES – BLOCK 2 --}}
<table class="signatories-table" width="100%" cellspacing="0" cellpadding="8"
    style="margin-top:40px; page-break-inside: avoid; font-size:11px; table-layout:fixed; border:none;">
    <tr>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Personnel-in-Charge:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
        </td>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Immediate Supervisor:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
        </td>
        <td style="text-align:center; width:33%; border:none; background:none;">
            Dean / Head:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
        </td>
    </tr>
</table>

@endsection
@push('pdf-scripts')
<script type="text/php">
    if (isset($pdf)) {
        $pdf->page_script('
            $font = $fontMetrics->get_font("DejaVu Sans", "normal");
            $size = 9;

            // Y positions
            $yLine1 = $pdf->get_height() - 85; // AUF-FORM
            $yLine2 = $pdf->get_height() - 70; // Date + Rev
            $yRight = $yLine2;                 // Align "Generated" with second line

            // Left: AUF-FORM (first line)
            $formCode = "AUF-FORM-AS/PMO-31";
            $pdf->text(40, $yLine1, $formCode, $font, $size, [0,0,0]);

            // Left: Date + Revision (second line)
            $formMeta = "November 22, 2011   Rev. 0";
            $pdf->text(40, $yLine2, $formMeta, $font, $size, [0,0,0]);

            // Right: Generated (aligned with second line)
            // $generated = "Generated: ' . now()->format('F d, Y h:i A') . '";
            // $genWidth = $fontMetrics->get_text_width($generated, $font, $size);
            // $pdf->text($pdf->get_width() - 40 - $genWidth, $yRight, $generated, $font, $size, [0,0,0]);
        ');
    }
</script>
@endpush