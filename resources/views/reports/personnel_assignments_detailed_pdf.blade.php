@extends('reports.layout')

@section('title', 'Personnel Assignments Detailed Report')

@push('styles')
<style>
    body {
        font-size: 11px !important;
        margin: 0 auto;
    }

    .container {
        width: 100%;
        margin: 0 auto;
    }

    table.report {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        /* margin-bottom: 10px; */
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
    }

    .report th,
    .report td {
        border: 1px solid #dfdfdf;
        padding: 4px 6px;
        text-align: center;
        vertical-align: middle;
    }

    .report th {
        background: #f0f0f0;
        font-weight: bold;
    }

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-footer-group;
    }

    tr {
        page-break-inside: avoid;
    }

    /* Text colors */
    .text-gray {
        color: #555;
    }

    .text-green {
        color: #16a34a;
        font-weight: bold;
    }

    .text-blue {
        color: #2563eb;
        font-weight: bold;
    }

    .text-orange {
        color: #ea580c;
        font-weight: bold;
    }

    .text-purple {
        color: #7e22ce;
        font-weight: bold;
    }

    .text-red {
        color: #dc2626;
        font-weight: bold;
    }

    .head-gap td {
        height: 45px;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
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

$dateAssigned = '—';
if ($fromDate && $toDate) $dateAssigned = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $dateAssigned = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $dateAssigned = 'Until ' . $toDate->format('F d, Y');
@endphp

<div class="container">
    {{-- HEADER --}}
    <div style="text-align:center; margin-bottom:12px;">
        <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
    </div>

    <div style="border-top: 2px solid #000; margin: 14px 0 16px;"></div>

    <div style="text-align:center; margin-bottom:14px;">
        <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
            Personnel Assignments Detailed Report
        </h2>
    </div>

    {{-- FILTERS --}}
    <table style="width:100%; border-collapse:collapse; margin-bottom:-30px;">
        <tr>
            <td style="font-weight:bold; width:22%;">Unit / Department:</td>
            <td style="width:28%;">{{ $filters['department_name'] ?? '—' }}</td>
            <td style="font-weight:bold; width:22%;">Personnel Status:</td>
            <td style="width:28%;">{{ $filters['status_label'] ?? '—' }}</td>
        </tr>
        <tr>
            <td style="font-weight:bold;">Date Assigned:</td>
            <td>{{ $dateAssigned }}</td>
            <td style="font-weight:bold;">Date Generated:</td>
            <td>{{ now()->format('F d, Y') }}</td>
        </tr>
    </table>

    {{-- MAIN TABLE --}}
    <table class="report">
        <thead>
            <tr class="head-gap">
                <td colspan="7"></td>
            </tr>
            <tr>
                <th style="width:60px;">Code No.</th>
                <th style="width:150px;">Asset Name</th>
                <th style="width:150px;">Unit / Department</th>
                <th style="width:140px;">Previously Assigned To</th>
                <th style="width:140px;">Personnel in Charge</th>
                <th style="width:90px;">Date Assigned</th>
                <th style="width:170px;">Status</th>
            </tr>
        </thead>

        <tbody>
            @forelse($records as $r)
            <tr>
                <td>{{ $r['equipment_code'] ?? '—' }}</td>
                <td style="text-align:center;">
                    <strong>{{ $r['asset_name'] ?? '—' }}</strong><br>
                    <small class="text-gray">{{ $r['category'] ?? '—' }}</small><br>
                    @if($r['serial_no'])
                    <small class="text-blue">SN: {{ $r['serial_no'] }}</small>
                    @endif
                </td>
                <td>{{ $r['asset_unit_or_department'] ?? '—' }}</td>
                <td class="text-red">{{ $r['previous_personnel_name'] ?? '—' }}</td>
                <td style="font-weight:bold;">{{ $r['personnel_name'] ?? '—' }}</td>
                <td>{{ $r['date_assigned'] ? Carbon::parse($r['date_assigned'])->format('M d, Y') : '—' }}</td>
                <td style="text-align:center;">
                    @if($r['current_inventory_status'])
                    <div class="text-green">Inventory: {{ ucwords(str_replace('_', ' ', $r['current_inventory_status'])) }}</div>
                    @endif
                    @if($r['current_transfer_status'])
                    <div class="text-purple">Transfer: {{ ucwords(str_replace('_', ' ', $r['current_transfer_status'])) }}</div>
                    @endif
                    @if($r['current_turnover_disposal_status'])
                    <div class="text-orange">Turnover/Disposal: {{ ucwords(str_replace('_', ' ', $r['current_turnover_disposal_status'])) }}</div>
                    @endif
                    @if($r['current_off_campus_status'])
                    <div class="text-blue">Off-Campus: {{ ucwords(str_replace('_', ' ', $r['current_off_campus_status'])) }}</div>
                    @endif
                    @if(!$r['current_transfer_status'] && !$r['current_turnover_disposal_status'] && !$r['current_off_campus_status'] && !$r['current_inventory_status'])
                    <div class="text-gray">No recent activity</div>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:12px;">No data available.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection

@push('pdf-scripts')
<script type="text/php">
    if (isset($pdf)) {
    $pdf->page_script('
        $font = $fontMetrics->get_font("DejaVu Sans", "normal");
        $size = 9;
        $y1 = $pdf->get_height() - 85;
        $y2 = $pdf->get_height() - 70;
        $pdf->text(40, $y1, "AUF-FORM-AS/PMO-41", $font, $size);
        $pdf->text(40, $y2, "Oct.01, 2014 • Rev.0", $font, $size);
    ');
}
</script>
@endpush