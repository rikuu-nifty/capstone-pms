@extends('forms.layout')

@section('title', 'Turnover / Disposal Form')

@push('styles')
<style>
    .header {
        text-align: center;
        margin-bottom: 30px;
        margin-top: 20px;
    }

    .header h3 {
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
    }

    .info-table {
        width: 100%;
        border-collapse: collapse;
        /* margin-bottom: 10px; */
    }

    .info-table td {
        border: none;
        padding: 4px 6px;
        vertical-align: middle;
        text-align: right;
    }

    .label-text {
        font-weight: 600;
        font-size: 12px;
    }

    .value-line {
        display: inline-block;
        border-bottom: 0.8px solid #000;
        padding: 0 5px 2px;
        min-width: 120px;
        max-width: 120px;
        text-align: center;
        font-size: 12px;
    }

    .auth-paragraph {
        font-size: 12px;
        text-align: justify;
        /* margin-top: -2px; */
        line-height: 1.6;
    }

    /* Checkbox styling */
    .checkbox {
        display: inline-block;
        width: 10px;
        height: 10px;
        border: 1px solid #000;
        vertical-align: middle;
        margin-top: 5px;
        /* margin-right: 4px; */
        position: relative;
    }

    .checkbox.checked::after {
        content: "";
        position: absolute;
        left: 7px;
        top: -10px;
        width: 4px;
        height: 18px;
        border: solid #000;
        border-width: 0 1.2px 1.2px 0;
        transform: rotate(45deg);
    }

    .checkbox-label {
        font-weight: bold;
        text-transform: lowercase;
    }

    table.assets-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: -12px;
    }

    table.assets-table th,
    table.assets-table td {
        border: 1px solid #000;
        padding: 5px 8px;
        text-align: center;
        vertical-align: middle;
    }

    table.assets-table th {
        font-weight: 600;
        background: #f3f3f3;
    }

    /* optional safety against partial pagination mismatches */
    /* table.assets-table td[rowspan],
    table.assets-table th[rowspan] {
        background: #fff;
        -webkit-print-color-adjust: exact;
    } */

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-row-group;
    }

    table.assets-table tr {
        page-break-inside: avoid;
    }

    .remarks {
        margin-top: 12px;
        font-size: 12px;
    }

    .signature-block {
        margin-top: 45px;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-line {
        width: 170px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }

    .signature-block p {
        margin: 2px 0;
    }

    .signature-block p[style*="font-weight:bold"] {
        margin-bottom: 3px;
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;

/**
* Split assets into chunks of ~20 rows per page to safely re-render merged cells
* (Adjust $perPage if needed for your page length)
*/
$perPage = 20;
$chunks = $assets->chunk($perPage);
@endphp

<div class="header">
    <h3>Turnover / Disposal Form</h3>
</div>

{{-- DOCUMENT DATE ONLY --}}
<table class="info-table">
    <tr>
        <td>
            <span class="label-text">Date:&nbsp;</span>
            <span class="value-line">
                {{ $turnoverDisposal->document_date ? Carbon::parse($turnoverDisposal->document_date)->format('F d, Y') : '—' }}
            </span>
        </td>
    </tr>
</table>

{{-- AUTHORIZATION --}}
<p class="auth-paragraph">
    This is to authorize Mr./Mrs.
    <strong><u>{{ strtoupper($turnoverDisposal->personnel->full_name ?? '_________________') }}</u></strong>
    of College/Unit
    <strong><u>{{ strtoupper($turnoverDisposal->issuingOffice->name ?? '_________________') }}</u></strong>
    to
    <span class="checkbox {{ $turnoverDisposal->type === 'turnover' ? 'checked' : '' }}"></span>
    <span class="checkbox-label">turnover</span>
    &nbsp;/&nbsp;
    <span class="checkbox {{ $turnoverDisposal->type === 'disposal' ? 'checked' : '' }}"></span>
    <span class="checkbox-label">dispose</span>
    the following properties/equipment as follows.
</p>

{{-- PAGINATED ASSET TABLE --}}
@foreach($chunks as $chunkIndex => $chunk)
<table class="assets-table" style="{{ $chunkIndex > 0 ? 'page-break-before: always;' : '' }}">
    <thead>
        <tr class="spacer-row">
            <td colspan="4" style="height:20px; border:none; border-bottom:1px solid #000; background:#fff;"></td>
        </tr>
        <tr>
            <th style="width:8%;">Qty</th>
            <th style="width:42%;">Items / Description</th>
            <th style="width:25%;">Issuing Office</th>
            <th style="width:25%;">Receiving Office</th>
        </tr>
    </thead>
    <tbody>
        @php $rowCount = count($chunk); @endphp

        @if($rowCount > 0)
        {{-- First row of each page with rowspan cells --}}
        <tr>
            <td>1</td>
            <td>{{ $chunk->first()->asset_name ?? '—' }}{{ $chunk->first()->description ? ' - ' . $chunk->first()->description : '' }}</td>
            <td rowspan="{{ $rowCount }}" style="vertical-align: middle;">
                {{ $turnoverDisposal->issuingOffice->name ?? '—' }}
            </td>
            <td rowspan="{{ $rowCount }}" style="vertical-align: middle;">
                {{ $turnoverDisposal->receivingOffice->name ?? '—' }}
            </td>
        </tr>

        {{-- Remaining rows in this page chunk --}}
        @foreach($chunk->slice(1) as $a)
        <tr>
            <td>1</td>
            <td>{{ $a->asset_name ?? '—' }}{{ $a->description ? ' - ' . $a->description : '' }}</td>
        </tr>
        @endforeach
        @else
        {{-- In case there are no assets at all --}}
        <tr>
            <td colspan="4" style="text-align:center;">No assets listed.</td>
        </tr>
        @endif
    </tbody>
</table>
@endforeach

@if($turnoverDisposal->description)
<p class="remarks"><strong>Description:</strong> {{ $turnoverDisposal->description }}</p>
@endif

@if($turnoverDisposal->remarks)
<p class="remarks"><strong>Remarks:</strong> {{ $turnoverDisposal->remarks }}</p>
@endif

{{-- SIGNATORIES --}}
<div class="signature-block">
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Personnel In Charge:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($turnoverDisposal->personnel->full_name ?? '—') }}</p>
        <p style="font-size:11px;">{{ $turnoverDisposal->personnel->position ?? 'PMO Staff' }}</p>
    </div>

    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Noted By:</p>
        <div class="signature-line"></div>
        @if($turnoverDisposal->noted_by_name)
        <p style="font-weight:bold;">{{ strtoupper($turnoverDisposal->noted_by_name) }}</p>
        <p style="font-size:11px;">{{ $turnoverDisposal->noted_by_title ?? 'Dean / Head' }}</p>
        @else
        <p style="color:#888;">—</p>
        <p style="font-size:11px;">Dean / Head</p>
        @endif
    </div>

    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Approved By:</p>
        <div class="signature-line"></div>
        @php $approved = $signatories['approved_by'] ?? null; @endphp
        @if($approved)
        <p style="font-weight:bold;">{{ strtoupper($approved->name ?? '—') }}</p>
        <p style="font-size:11px;">{{ $approved->title ?? 'Head, PMO' }}</p>
        @else
        <p style="color:#888;">—</p>
        <p style="font-size:11px;">Head, PMO</p>
        @endif
    </div>
</div>
@endsection