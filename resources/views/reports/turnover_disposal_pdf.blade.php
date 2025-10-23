@extends('reports.layout')

@section('title', 'Turnover / Disposal Report')

@push('styles')
<style>
    body {
        font-size: 11px !important;
    }

    table.report {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        margin-bottom: 40px;
    }

    .report {
        /* table-layout: fixed; */
        table-layout: auto;
        word-wrap: break-word;
        white-space: normal;
    }

    .report th,
    .report td {
        border: 1px solid #dcdcdc;
        padding: 4px 6px;
        text-align: center;
        vertical-align: middle;
        word-break: break-word;
        white-space: normal;
        /* min-width: 20px;
        max-width: 150px;  */
        /* prevents overflow beyond page */
    }

    th {
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

    .text-green {
        color: #15803d;
        font-weight: 600;
    }

    .text-red {
        color: #dc2626;
        font-weight: 600;
    }

    .head-gap td {
        height: 20px;
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

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');
@endphp

{{-- ===== Header ===== --}}
<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
</div>

<div style="border-top: 2px solid #000; margin: 14px 0 16px;"></div>

<div style="text-align:center; margin-bottom:14px;">
    <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
        Turnover / Disposal Report
    </h2>
</div>

{{-- ===== Report Metadata ===== --}}
<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
        <td style="font-weight:bold; width:20%;">Date Range:</td>
        <td style="width:30%;">{{ $reportPeriod }}</td>
        <td style="font-weight:bold; width:20%;">Date Generated:</td>
        <td style="width:30%;">{{ now()->format('F d, Y') }}</td>
    </tr>
</table>

{{-- ===== Data Table ===== --}}
<table class="report">
    <thead>
        <tr class="head-gap">
            <td colspan="10"></td>
        </tr>
        <tr>
            <th style="width:45px;">Record No.</th>
            <th style="width:140px;">Asset Name</th>
            <th style="width:60px;">Type</th>
            <th style="width:80px;">Turnover Category</th>
            <th style="width:60px;">For Donation</th>
            <th style="width:100px;">Issuing Office</th>
            <th style="width:100px;">Receiving Office</th>
            <th style="width:90px;">Status</th>
            <th style="width:75px;">Date</th>
            <th style="width:140px;">Remarks</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($records as $r)
        <tr>
            <td>{{ $r->turnover_disposal_id ?? '—' }}</td>
            <td style="text-align:left;">
                <strong>{{ $r->asset_name ?? '—' }}</strong><br>
                @if(!empty($r->serial_no))
                <small style="color:#2563eb;">SN: {{ $r->serial_no }}</small><br>
                @endif
                <small style="color:#555;">{{ $r->category ?? '—' }}</small>
            </td>
            <td>{{ ucfirst($r->type ?? '—') }}</td>
            <td>{{ $r->turnover_category ? ucwords(str_replace('_', ' ', $r->turnover_category)) : '—' }}</td>
            <td>
                @if($r->is_donation)
                <span class="text-green" style="font-size: 13px;">Yes</span>
                @else
                <span class="text-red" style="font-size: 13px;">No</span>
                @endif
            </td>
            <td>{{ $r->issuing_office ?? '—' }}</td>
            <td>{{ $r->receiving_office ?? '—' }}</td>
            <td>{{ ucwords(str_replace('_', ' ', $r->td_status ?? '—')) }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td style="text-align:left;">{{ $r->remarks ?? '—' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="10" style="text-align:center; padding:12px;">No records found for this report.</td>
        </tr>
        @endforelse
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
            $pdf->text(40, $y1, "AUF-FORM-AS/PMO-32", $font, $size);
            $pdf->text(40, $y2, "November 22, 2011   Rev. 0", $font, $size);
        ');
    }
</script>
@endpush