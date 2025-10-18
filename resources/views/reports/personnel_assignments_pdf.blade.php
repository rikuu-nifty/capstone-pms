@extends('reports.layout')

@section('title', 'Personnel Assignments Summary Report')

@push('styles')
<style>
    body {
        font-size: 11px !important;
    }

    table.report {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        margin-bottom: 80px;
    }

    .report th,
    .report td {
        border: 1px solid #dfdfdfff;
        padding: 5px 6px;
        text-align: center;
        vertical-align: middle;
    }

    th {
        background: #f0f0f0;
        font-weight: bold;
    }

    .head-gap td {
        border: none !important;
        height: 26px;
        background: transparent !important;
    }

    .group-dept td {
        font-weight: bold;
        background: #e5e7ebff;
        text-align: left;
        padding-left: 8px;
    }

    .subtotal-row td {
        font-weight: bold;
        background: #f9fafb;
        border-top: 2px solid #000;
        text-align: right;
    }

    .signature-block {
        margin-top: 40px;
        width: 100%;
        page-break-inside: avoid;
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;

$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$departmentId = $filters['department_id'] ?? null;
$status = $filters['status'] ?? null;

// Handle date range display
$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;
$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y').' – '.$toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y').' – Present';
elseif ($toDate) $reportPeriod = 'Until '.$toDate->format('F d, Y');

// Format other filters
$departmentName = $filters['department_name'] ?? '—';

$statusLabel = $filters['status_label'] ?? '—';

/* ---- Group personnel by department ---- */
$grouped = collect($records)->groupBy(fn($r) => $r['department'] ?? 'Unassigned');
@endphp

{{-- Header --}}
<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; font-weight:bold;">Office of the Administrative Services</h3>
</div>

<div style="border-top:2px solid #000; margin:14px 0 16px;"></div>

<div style="text-align:center; margin-bottom:14px;">
    <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
        Personnel Assignments Summary Report
    </h2>
</div>

{{-- Report Details --}}
<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
        <td style="font-weight:bold; width:20%;">Date Assigned:</td>
        <td style="width:30%;">{{ $reportPeriod }}</td>
        <td style="font-weight:bold; width:20%;">Date Generated:</td>
        <td style="width:30%;">{{ now()->format('F d, Y') }}</td>
    </tr>
    <tr>
        <td style="font-weight:bold;">Unit / Department:</td>
        <td>{{ $departmentName }}</td>
        <td style="font-weight:bold;">Personnel Status:</td>
        <td>{{ $statusLabel }}</td>
    </tr>
</table>

{{-- Main table --}}
<table class="report">
    <thead>
        <tr class="head-gap">
            <td colspan="5"></td>
        </tr>
        <tr>
            <th style="width:12%;">Assignment ID</th>
            <th style="width:35%;">Personnel-in-Charge</th>
            <th style="width:20%;">Status</th>
            <th style="width:17.5%;">Past Assets</th>
            <th style="width:17.5%;">Current Assets</th>
        </tr>
    </thead>

    <tbody>
        @php
        $grandPast = 0;
        $grandCurrent = 0;
        @endphp

        @foreach ($grouped as $dept => $rows)
        <tr class="group-dept">
            <td colspan="5">Unit / Department: {{ $dept }}</td>
        </tr>

        @php
        $deptPast = 0;
        $deptCurrent = 0;
        @endphp

        @foreach ($rows as $r)
        @php
        $deptPast += $r['past_assets_count'];
        $deptCurrent += $r['current_assets_count'];
        $grandPast += $r['past_assets_count'];
        $grandCurrent += $r['current_assets_count'];
        @endphp

        <tr>
            <td>{{ $r['id'] }}</td>
            <td>{{ $r['full_name'] }}</td>
            <td>{{ $r['status'] }}</td>
            <td style="color:#2563eb; font-weight:bold;">{{ $r['past_assets_count'] }}</td>
            <td style="color:#16a34a; font-weight:bold;">{{ $r['current_assets_count'] }}</td>
        </tr>
        @endforeach

        {{-- Subtotal --}}
        <tr class="subtotal-row">
            <td colspan="2" style="text-align:right;">Total for {{ $dept }}:</td>
            <td style="text-align:center;">—</td>
            <td style="text-align:center;">{{ $deptPast }}</td>
            <td style="text-align:center;">{{ $deptCurrent }}</td>
        </tr>
        @endforeach

        @if($grouped->isEmpty())
        <tr>
            <td colspan="5" style="text-align:center;">No records found.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection

@push('pdf-scripts')
<script type="text/php">
    if (isset($pdf)) {
    $pdf->page_script('
        $font = $fontMetrics->get_font("DejaVu Sans", "normal");
        $size = 9;
        $y1 = $pdf->get_height() - 85;
        $y2 = $pdf->get_height() - 70;
        $pdf->text(40, $y1, "AUF-FORM-AS/PMO-42", $font, $size);
        $pdf->text(40, $y2, "'.now()->format('F d, Y').'   Rev. 0", $font, $size);
    ');
}
</script>
@endpush