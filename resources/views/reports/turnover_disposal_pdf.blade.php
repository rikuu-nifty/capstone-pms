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
    }

    .report td,
    .report th {
        border: 1px solid #dfdfdfff;
    }

    .report .head-gap td {
        border: none !important;
        background: transparent !important;
    }

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-row-group;
    }

    tr {
        page-break-inside: avoid;
    }

    th,
    td {
        padding: 6px 8px;
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

    /* Signatories */
    .signatories-table,
    .signatories-table td,
    .signatories-table th {
        border: none !important;
        background: none !important;
        padding: 8px;
    }

    .signatories-table td {
        text-align: center;
        vertical-align: top;
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
$filterCategory = !empty($filters['category_id']) ? optional(\App\Models\Category::find($filters['category_id']))->name : null;

/* ------- Group: Month → Issuing Office → Type ------- */
$grouped = collect($records)
->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated')
->map(fn($monthItems) =>
$monthItems->groupBy('issuing_office')
->map(fn($officeItems) => $officeItems->groupBy('type'))
);
@endphp

{{-- Title --}}
<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
    <p style="margin:0;">Turnover/Disposal Report</p>
</div>

<div style="border-top: 2px solid #000; margin: 14px 0 16px;"></div>

{{-- Report Details --}}
<table class="details">
    <tr>
        <td class="label">Issuing Office (Filter):</td>
        <td class="value">{{ $filterIssuing ?? '—' }}</td>
        <td class="label">Receiving Office (Filter):</td>
        <td class="value">{{ $filterReceiving ?? '—' }}</td>
    </tr>
    <tr>
        <td class="label">Category:</td>
        <td class="value">{{ $filterCategory ?? '—' }}</td>
        <td class="label">Date Range:</td>
        <td class="value">{{ $reportPeriod }}</td>
    </tr>
</table>

{{-- Main table --}}
<table class="report" cellspacing="0" cellpadding="0">
    <thead>
        <tr class="head-gap">
            <td colspan="8"></td>
        </tr>
        <tr>
            <th style="width:36px;">#</th>
            <th style="width:120px;">Asset Name (Category)</th>
            <th style="width:100px;">Serial No.</th>
            <th style="width:100px;">Receiving Office</th>
            <th style="width:90px;">Unit Cost</th>
            <th style="width:80px;">Status</th>
            <th style="width:90px;">Document Date</th>
            <th style="width:150px;">Remarks</th>
        </tr>
    </thead>
    <tbody>
        @php $i = 1; @endphp

        @foreach ($grouped as $month => $offices)
        <tr class="group-month">
            <td colspan="8">{{ $month }}</td>
        </tr>

        @foreach ($offices as $office => $types)
        <tr class="group-office">
            <td colspan="8">Issuing Office: {{ $office ?? '—' }}</td>
        </tr>

        @foreach ($types as $type => $rows)
        <tr class="group-type">
            <td colspan="8">{{ ucfirst($type) }}</td>
        </tr>

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
            <td>{{ $r->receiving_office ?? '—' }}</td>
            <td>
                {{ isset($r->unit_cost) ? '₱ ' . number_format((float)$r->unit_cost, 2) : '—' }}
            </td>
            <td>{{ ucfirst($r->asset_status ?? $r->td_status ?? '—') }}</td>
            <td>
                {{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}
            </td>
            <td style="white-space:normal; word-break:break-word;">{{ $r->remarks ?? '—' }}</td>
        </tr>
        @endforeach
        @endforeach
        @endforeach
        @endforeach
    </tbody>

    <tfoot>
        @php
        $totalTurnovers = collect($records)->where('type','turnover')->count();
        $totalDisposals = collect($records)->where('type','disposal')->count();
        $totalCompleted = collect($records)->where('asset_status','completed')->count();
        $totalCost = collect($records)->sum(fn($r) => (float) ($r->unit_cost ?? 0));
        @endphp
        <tr style="font-weight:bold; background:#f9f9f9; border-top:2px solid #000;">
            <td colspan="8" style="text-align:right; padding:8px;">
                Total Turnovers: {{ $totalTurnovers }} |
                Total Disposals: {{ $totalDisposals }} |
                Completed: {{ $totalCompleted }} |
                Total Cost: ₱ {{ number_format($totalCost, 2) }}
            </td>
        </tr>
    </tfoot>
</table>

{{-- SIGNATORIES --}}
<table class="signatories-table" width="100%" cellspacing="0" cellpadding="8" style="margin-top:40px;">
    <tr>
        <td style="width:33%;">
            Prepared by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Property Clerk
        </td>
        <td style="width:33%;">
            Verified by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Head, PMO
        </td>
        <td style="width:33%;">
            Noted by:
            <div style="border-bottom:1px solid #111; width:80%; margin:50px auto 6px;"></div>
            Internal Audit
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
        $y = $pdf->get_height() - 30;
        $pdf->text(40, $y, "AUF-FORM-AS/PMO-32", $font, $size, [0,0,0]);
        $pdf->text($pdf->get_width()-120, $y, "Generated: ' . now()->format('F d, Y h:i A') . '", $font, $size, [0,0,0]);
    ');
}
</script>
@endpush