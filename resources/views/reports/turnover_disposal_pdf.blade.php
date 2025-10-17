@extends('reports.layout')

@section('title', 'Turnover/Disposal Report')

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

    /* Spacer row inside thead to keep header clear of the letterhead on every page */
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

    .group-type td {
        font-weight: bold;
        font-style: italic;
        background: #f5f5f5;
        padding-left: 40px;
    }

    table.details {
        width: 100%;
        border-collapse: collapse;
        /* margin-bottom: 10px; */
        table-layout: fixed;
    }

    table.details td {
        padding: 6px;
    }

    table.details td.label {
        width: 20%;
        font-weight: bold;
    }

    table.details td.value {
        width: 30%;
    }

    .report td:last-child {
        white-space: normal;
        word-wrap: break-word;
    }

    /* Signatories */
    /* === match Inventory Sheet helpers === */
    .acknowledgement {
        margin-top: 50px;
        font-size: 12px;
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

    /* extras for this form */
    .sig-line {
        border-bottom: 1px solid #111;
        width: 50%;
        margin: 50px auto 6px;
    }

    .chk {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1px solid #000;
        vertical-align: middle;
        margin: 10px 2px 0 4px;
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

$filterIssuing = !empty($filters['issuing_office_id']) ? optional(\App\Models\UnitOrDepartment::find($filters['issuing_office_id']))->name : null;
$filterReceiving = !empty($filters['receiving_office_id']) ? optional(\App\Models\UnitOrDepartment::find($filters['receiving_office_id']))->name : null;
$filterType = !empty($filters['type']) ? ucfirst($filters['type']) : null;

/* ------- Group: Month → Issuing Office → Type ------- */
$grouped = collect($records)
->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated')
->map(fn($monthItems) =>
$monthItems->groupBy(fn($r) => trim(strtoupper($r->issuing_office ?? '—')))
->map(fn($officeItems) => $officeItems->groupBy('type'))
);
@endphp

{{-- Title --}}
<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
</div>

<div style="border-top: 2px solid #000; margin: 14px 0 16px;"></div>

<div style="text-align:center; margin-bottom:14px;">
    <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
        Turnover / Disposal Report
    </h2>
</div>

{{-- Report Details --}}
<table class="details">
    <tr>
        <td class="label">Issuing Office (Filter):</td>
        <td class="value">{{ $filterIssuing ?? '—' }}</td>
        <td class="label">Receiving Office (Filter):</td>
        <td class="value">{{ $filterReceiving ?? '—' }}</td>
    </tr>
    <tr>
        <td class="label">Type:</td>
        <td class="value">{{ $filterType ?? '—' }}</td>
        <td class="label">Date:</td>
        <td class="value">{{ $reportPeriod }}</td>
    </tr>
</table>

{{-- Main table --}}
<table class="report" cellspacing="0" cellpadding="0">
    <thead>
        <tr class="head-gap">
            <td colspan="10"></td>
        </tr>
        <tr>
            <th style="width:30px;">Record No.</th>
            <th style="width:105px;">Asset Name</th>
            <th style="width:75px;">Serial No.</th>
            <th style="width:80px;">Turnover Category</th>
            <th style="width:55px;">For Donation</th>
            <th style="width:90px;">Receiving Office</th>
            <th style="width:75px;">Unit Cost</th>
            <th style="width:70px;">Status</th>
            <th style="width:80px;">Date</th>
            <th style="width:110px;">Remarks</th>

        </tr>
    </thead>
    <tbody>
        @php $i = 1; @endphp

        @foreach ($grouped as $month => $offices)
        <tr class="group-month">
            <td colspan="10">{{ $month }}</td>
        </tr>

        @foreach ($offices as $office => $types)
        @php
        // Show Issuing Office row if:
        // - Issuing office filter was NOT applied
        // - OR this month has more than one office
        $showOfficeRow = empty($filters['issuing_office_id']) || $offices->count() > 1;
        @endphp

        @if ($showOfficeRow)
        <tr class="group-office">
            <td colspan="10">Issuing Office: {{ $office ?? '—' }}</td>
        </tr>
        @endif

        @foreach ($types as $type => $rows)
        @php
        // Show Type row if:
        // - Type filter was NOT applied
        // - OR this office has more than one type
        $showTypeRow = empty($filters['type']) || $types->count() > 1;
        @endphp

        @if ($showTypeRow)
        <tr class="group-type">
            <td colspan="10">{{ ucfirst($type) }}</td>
        </tr>
        @endif

        @foreach ($rows as $r)
        <tr style="text-align:center; border-bottom:1px solid #ddd;">
            <td>{{ $i++ }}</td>
            <td>
                <div>
                    <strong>{{ $r->asset_name ?? '—' }}</strong><br>
                    <small>{{ $r->category ?? '—' }}</small>
                </div>
            </td>
            <td>{{ $r->serial_no ?? '—' }}</td>
            <td>{{ $r->turnover_category ? ucfirst(str_replace('_', ' ', $r->turnover_category)) : '—' }}</td>
            <td>{{ $r->is_donation ? 'Yes' : 'No' }}</td>
            <td>{{ $r->receiving_office ?? '—' }}</td>
            <td>{{ isset($r->unit_cost) ? '₱ ' . number_format((float)$r->unit_cost, 2) : '—' }}</td>
            <td>{{ ucfirst($r->asset_status ?? $r->td_status ?? '—') }}</td>
            <td>{{ $r->document_date ? \Carbon\Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td style="white-space:normal; word-break:break-word;">
                {{ $r->remarks ?? '—' }}
            </td>
        </tr>
        @endforeach
        @endforeach

        {{-- ✅ Subtotals for the entire issuing office --}}
        @php $officeAssets = $types->flatten(1); @endphp
        <tr style="font-weight:bold; background:#f9f9f9; border-top:2px solid #000;">
            <td colspan="10" style="text-align:right; padding:6px;">
                Total Assets: {{ number_format($officeAssets->count()) }}
            </td>
        </tr>
        <tr style="font-weight:bold; background:#f9f9f9; border-bottom:2px solid #000;">
            <td colspan="10" style="text-align:right; padding:6px;">
                Total Cost: ₱ {{ number_format($officeAssets->sum(fn($r) => (float) ($r->unit_cost ?? 0)), 2) }}
            </td>
        </tr>
        @endforeach
        @endforeach
    </tbody>

</table>

<table width="100%" cellspacing="0" cellpadding="0"
    style="border-collapse:collapse; margin-top:12px; page-break-inside: avoid;">
    @php
    $totalTurnovers = collect($records)->where('type','turnover')->count();
    $totalDisposals = collect($records)->where('type','disposal')->count();
    $totalAssets = collect($records)->count();
    $totalCost = collect($records)->sum(fn($r) => (float) ($r->unit_cost ?? 0));
    @endphp

    {{-- Section heading --}}
    <tr class="head-gap">
        <td colspan="10"></td>
    </tr>
    <tr style="background:#e2e8f0; font-weight:bold; border-top:2px solid #000; border-bottom:2px solid #000;">
        <td style="text-align:center; padding:8px; font-size:13px;" colspan="10">
            SUMMARY
        </td>
    </tr>

    <tr style="font-weight:bold; background:#f9f9f9;">
        <td colspan="10" style="text-align:right; padding:8px;">
            Total Turnovers: {{ number_format($totalTurnovers) }}
        </td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9;">
        <td colspan="10" style="text-align:right; padding:8px;">
            Total Disposals: {{ number_format($totalDisposals) }}
        </td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9;">
        <td colspan="10" style="text-align:right; padding:8px;">
            Total Assets: {{ number_format($totalAssets) }}
        </td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9; border-bottom:2px solid #000;">
        <td colspan="10" style="text-align:right; padding:8px;">
            Total Cost: ₱ {{ number_format($totalCost, 2) }}
        </td>
    </tr>
</table>

<div style="page-break-before: always; margin-top:80px;"></div>

{{-- SIGNATORIES – BLOCK 1 (same layout as Inventory Sheet) --}}
<table class="signatories-table signature-block" width="100%" cellspacing="0" cellpadding="8">
    <tr>
        <td style="width:50%;">Personnel-in-Charge:<div class="sig-line"></div>
        </td>
        <td style="width:50%;">Head / Unit:<div class="sig-line"></div>
        </td>
    </tr>
</table>

{{-- ACKNOWLEDGEMENT --}}
<table class="signatories-table acknowledgement" width="100%" cellspacing="0" cellpadding="8" style="table-layout:fixed;">
    <tr>
        <td colspan="2" style="vertical-align:top; padding:0 40px; line-height:1.6;">
            <p style="margin:0 0 12px;">
                This is to authorize Mr./Mrs.
                <span style="display:inline-block; border-bottom:1px solid #000; min-width:200px;"></span>
                of the College/Unit
                <span style="display:inline-block; border-bottom:1px solid #000; min-width:200px;"></span>
                to <span class="chk"></span> <strong>Turn-over</strong> /
                <span class="chk"></span> <strong>Dispose</strong> the following properties/equipment as follows:
            </p>
        </td>
    </tr>
</table>

{{-- SIGNATORIES – BLOCK 2 (same layout as Inventory Sheet) --}}
<table class="signatories-table signature-block" width="100%" cellspacing="0" cellpadding="8">
    <tr>
        <td style="width:50%;">Dean / Head:<div class="sig-line"></div>
        </td>
        <td style="width:50%;">Head, PMO:<div class="sig-line"></div>
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
            $yLine1 = $pdf->get_height() - 85; // AUF-FORM code
            $yLine2 = $pdf->get_height() - 70; // Date + Rev

            // Left: AUF-FORM (line 1)
            $formCode = "AUF-FORM-AS/PMO-32";
            $pdf->text(40, $yLine1, $formCode, $font, $size);

            // Left: Date + Revision (line 2)
            $formMeta = "November 22, 2011   Rev. 0";
            $pdf->text(40, $yLine2, $formMeta, $font, $size);
        ');
    }
</script>
@endpush