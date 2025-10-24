@extends('reports.layout')

@section('title', 'Donation Summary Report')

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

    .report td,
    .report th {
        border: 1px solid #dfdfdfff;
    }

    .report td {
        white-space: normal;
        word-break: break-word;
    }

    .report .head-gap td {
        border: none !important;
        background: transparent !important;
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

    th,
    td {
        padding: 4px 6px;
    }

    th {
        background: #f0f0f0;
        font-weight: bold;
        text-align: center;
    }

    /* Spacer row inside thead to keep header clear of letterhead on every page */
    .head-gap td {
        height: 26px;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
    }

    .group-month td {
        font-weight: bold;
        background: #dfdfdfff;
        padding: 6px 8px;
    }

    .group-office td {
        font-weight: bold;
        background: #ebeaeaff;
        padding-left: 20px;
    }

    /* Signature styles reused */
    .signature-block {
        margin-top: 40px;
        width: 100%;
        page-break-inside: avoid;
    }

    .signatories-table,
    .signatories-table td {
        border: none !important;
        background: none !important;
        padding: 8px;
    }

    .sig-line {
        border-bottom: 1px solid #111;
        width: 50%;
        margin: 50px auto 6px;
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;

/* ------- Report Details (from filters) ------- */
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;

$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');

/* ------- Group: Month → Issuing Office ------- */
$grouped = collect($donationSummary)
->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated')
->map(fn($monthItems) =>
$monthItems->groupBy(fn($r) => trim(strtoupper($r->issuing_office ?? '—')))
);

function formatPeso($amount) {
return '₱ ' . number_format((float)$amount, 2, '.', ', ');
}
@endphp

{{-- Title --}}
<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
</div>

<div style="border-top: 2px solid #000; margin: 14px 0 16px;"></div>

<div style="text-align:center; margin-bottom:14px;">
    <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
        Donation Summary Report
    </h2>
</div>

{{-- Report Details --}}
<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
        <td style="font-weight:bold; width:20%;">Date:</td>
        <td style="width:30%;">{{ $reportPeriod }}</td>
        <td style="font-weight:bold; width:20%;">Date Generated:</td>
        <td style="width:30%;">{{ now()->format('F d, Y') }}</td>
    </tr>
</table>

{{-- Main grouped table --}}
<table class="report" cellspacing="0" cellpadding="0">
    <thead>
        <tr class="head-gap">
            <td colspan="8"></td>
        </tr>
        <tr>
            <th style="width:60px;">Record No.</th>
            <th style="width:100px;">Date of Donation</th>
            <th style="width:150px;">Issuing Office</th>
            <th style="width:140px;">Recipient</th>
            <th style="width:150px;">Asset Name</th>
            <th style="width:90px;">Turnover Category</th>
            <th style="width:80px;">Unit Cost</th>
            <th style="width:150px;">Remarks</th>
        </tr>
    </thead>

    <tbody>
        @php
        $grandCount = 0;
        $grandCost = 0;
        @endphp

        @foreach ($grouped as $month => $offices)
        <tr class="group-month">
            <td colspan="8">{{ $month }}</td>
        </tr>

        @foreach ($offices as $office => $rows)
        <tr class="group-office">
            <td colspan="8">Issuing Office: {{ $office ?? '—' }}</td>
        </tr>

        @php
        $officeCount = 0;
        $officeCost = 0;
        @endphp

        @foreach ($rows as $r)
        @php
        $unitCost = (float) ($r->unit_cost ?? 0);
        $officeCount++;
        $officeCost += $unitCost;
        $grandCount++;
        $grandCost += $unitCost;
        @endphp
        <tr style="text-align:center;">
            <td>{{ $r->record_id }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td>{{ $r->issuing_office ?? '—' }}</td>
            <td>{{ $r->receiving_office ?? $r->external_recipient ?? '—' }}</td>
            <td>
                <strong>{{ $r->asset_name ?? '—' }}</strong><br>
                @if($r->serial_no)
                <small style="color:#555;">SN: {{ $r->serial_no }}</small><br>
                @endif
                <small style="color:#555;">{{ $r->category ?? '—' }}</small>
            </td>
            <td>{{ $r->turnover_category ? ucfirst(str_replace('_', ' ', $r->turnover_category)) : '—' }}</td>
            <td>{{ formatPeso($r->unit_cost ?? 0) }}</td>
            <td>{{ $r->asset_remarks ?? '—' }}</td>
        </tr>
        @endforeach

        {{-- Office subtotal --}}
        <tr style="font-weight:bold; background:#f9f9f9; border-top:2px solid #000;">
            <td colspan="8" style="text-align:right; padding:6px;">
                Total Donations: {{ number_format($officeCount) }}
            </td>
        </tr>
        <tr style="font-weight:bold; background:#f9f9f9; border-bottom:2px solid #000;">
            <td colspan="8" style="text-align:right; padding:6px;">
                Total Cost: {{ formatPeso($officeCost) }}
            </td>
        </tr>
        @endforeach
        @endforeach

        @if($grandCount === 0)
        <tr>
            <td colspan="8" style="text-align:center; padding:12px;">No donation records found.</td>
        </tr>
        @endif
    </tbody>
</table>

{{-- Summary Section --}}
<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:12px; page-break-inside: avoid;">
    <tr class="head-gap">
        <td colspan="8"></td>
    </tr>
    <tr style="background:#e2e8f0; font-weight:bold; border-top:2px solid #000; border-bottom:2px solid #000;">
        <td colspan="8" style="text-align:center; padding:8px; font-size:13px;">OVERALL SUMMARY</td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9;">
        <td colspan="8" style="text-align:right; padding:8px;">
            Total Donation Records: {{ number_format($grandCount) }}
        </td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9; border-bottom:2px solid #000;">
        <td colspan="8" style="text-align:right; padding:8px;">
            Grand Total Cost: {{ formatPeso($grandCost) }}
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
            $y1 = $pdf->get_height() - 85;
            $y2 = $pdf->get_height() - 70;
            $pdf->text(40, $y1, "AUF-FORM-AS/PMO-32", $font, $size);
            $pdf->text(40, $y2, "November 22, 2011   Rev. 0", $font, $size);
        ');
    }
</script>
@endpush