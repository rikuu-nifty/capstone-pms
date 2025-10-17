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
        margin-bottom: 60px;
    }

    th,
    td {
        border: 1px solid #dfdfdf;
        padding: 5px 6px;
        text-align: center;
        vertical-align: top;
        word-break: break-word;
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

function formatPeso($amount) {
return '₱ ' . number_format((float)$amount, 2, '.', ', ');
}
@endphp

<div style="text-align:center; margin-bottom:12px;">
    <h3 style="margin-top:10px; margin-bottom:5px; font-weight:bold;">Office of the Administrative Services</h3>
</div>
<div style="border-top:2px solid #000; margin:14px 0 16px;"></div>
<div style="text-align:center; margin-bottom:14px;">
    <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">
        Donation Summary Report
    </h2>
</div>

<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
        <td style="font-weight:bold; width:20%;">Date:</td>
        <td style="width:30%;">{{ $reportPeriod }}</td>
        <td style="font-weight:bold; width:20%;">Date Report Generated:</td>
        <td style="width:30%;">{{ now()->format('F d, Y') }}</td>
    </tr>
</table>

<table class="report" cellspacing="0" cellpadding="0">
    <thead>
        <tr class="spacer-row">
            <td colspan="7" style="height:10px; border:none; border-bottom:0.8px solid #000; background:#fff;"></td>
        </tr>
        <tr>
            <th style="width:40px;">Record No.</th>
            <th style="width:100px;">Date of Donation</th>
            <th style="width:160px;">Issuing Office (Source)</th>
            <th style="width:170px;">Description of Items</th>
            <th style="width:50px;">Quantity</th>
            <th style="width:100px;">Total Cost</th>
            <th style="width:170px;">Remarks</th>
        </tr>
    </thead>
    <tbody>
        @php
        $totalItems = 0;
        $grandTotalCost = 0;
        @endphp

        @forelse($donationSummary as $r)
        <tr>
            <td>{{ $r->record_id }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td>{{ $r->issuing_office ?? '—' }}</td>
            <td>
                @if($r->turnover_category)
                <strong>{{ ucfirst(str_replace('_', ' ', $r->turnover_category)) }}</strong><br>
                @endif
                <span style="font-size:10px; color:#555;">{{ $r->description ?? '—' }}</span>
            </td>
            <td>{{ $r->quantity }}</td>
            <td>{{ formatPeso($r->total_cost ?? 0) }}</td>
            <td>{{ $r->remarks ?? '—' }}</td>
        </tr>

        @php
        $totalItems += (int) $r->quantity;
        $grandTotalCost += (float) $r->total_cost;
        @endphp
        @empty
        <tr>
            <td colspan="7" style="text-align:center; padding:12px;">No donation records found.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<table width="100%" style="margin-top:10px; border-collapse:collapse;">
    <tr style="font-weight:bold; background:#f9f9f9;">
        <td style="text-align:right; padding:8px;">Total Donation Records: {{ number_format(count($donationSummary)) }}</td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9;">
        <td style="text-align:right; padding:8px;">Total Items Donated: {{ number_format($totalItems) }}</td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9; border-top:2px solid #000;">
        <td style="text-align:right; padding:8px;">Grand Total Cost: {{ formatPeso($grandTotalCost) }}</td>
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