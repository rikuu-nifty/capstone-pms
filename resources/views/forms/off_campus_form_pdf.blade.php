@extends('forms.layout')

@section('title', 'Off Campus Form')

@push('styles')
<style>
    .header {
        text-align: center;
        margin-bottom: 25px;
        margin-top: 20px;
    }

    .header h3 {
        font-size: 15px;
        font-weight: 700;
        text-decoration: underline;
    }

    table.info {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
        font-size: 12px;
    }

    table.info td {
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
        border-bottom: 1px solid #000;
        display: inline-block;
        min-width: 150px;
        text-align: center;
    }

    .auth {
        font-size: 12px;
        text-align: justify;
        line-height: 1.6;
        margin-top: 4px;
    }

    table.assets {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: 10px;
    }

    table.assets th,
    table.assets td {
        border: 1px solid #000;
        padding: 5px 8px;
        text-align: center;
        vertical-align: middle;
    }

    table.assets th {
        background: #f3f3f3;
        font-weight: 600;
    }

    .remarks,
    .purpose {
        font-size: 12px;
        margin-top: 10px;
    }

    .signature-block {
        margin-top: 40px;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-line {
        width: 180px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;
$perPage = 20;
$chunks = $assets->chunk($perPage);
@endphp

<div class="header">
    <h3>Off Campus Form</h3>
</div>

<table class="info">
    <tr>
        <td>
            <span class="label-text">Date Issued:</span>
            <span class="value-line">
                {{ $offCampus->date_issued ? Carbon::parse($offCampus->date_issued)->format('F d, Y') : '—' }}
            </span>
        </td>
    </tr>
</table>

<p class="auth">
    This is to authorize Mr./Mrs.
    <strong><u>{{ strtoupper($offCampus->requester_name ?? '_________________') }}</u></strong>
    of College/Unit
    <strong><u>{{ strtoupper($offCampus->collegeOrUnit->name ?? '_________________') }}</u></strong>
    to bring in / take out from the Angeles University Foundation premises the following properties/equipment described as follows:
</p>

@foreach($chunks as $chunkIndex => $chunk)
<table class="assets" @if($chunkIndex> 0) style="page-break-before: always;" @endif>
    <thead>
        <tr>
            <th style="width:10%;">Qty</th>
            <th style="width:15%;">Units</th>
            <th style="width:50%;">Items / Description</th>
            <th style="width:25%;">Comments</th>
        </tr>
    </thead>
    <tbody>
        @foreach($chunk as $a)
        <tr>
            <td>1</td>
            <td>{{ strtoupper($offCampus->units ?? '—') }}</td>
            <td>
                {{ $a->asset_name ?? '—' }}
                @if($a->assetModel)
                <br><small>Brand: {{ $a->assetModel->brand ?? '—' }}, Model: {{ $a->assetModel->model ?? '—' }}</small>
                @endif
                @if($a->serial_no)
                <br><small>Serial: {{ $a->serial_no }}</small>
                @endif
            </td>
            <td>{{ $offCampus->comments ?? '—' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endforeach

@if($offCampus->purpose)
<p class="purpose"><strong>Purpose:</strong> {{ $offCampus->purpose }}</p>
@endif

<p class="remarks">
    Approved for release for:
    [{{ $offCampus->remarks === 'official_use' ? '✔' : ' ' }}] OFFICIAL USE
    &nbsp;&nbsp;
    [{{ $offCampus->remarks === 'repair' ? '✔' : ' ' }}] REPAIR
</p>

<p class="remarks">
    Above item shall be returned on or before
    <strong>{{ $offCampus->return_date ? Carbon::parse($offCampus->return_date)->format('F d, Y') : '—' }}</strong>.
</p>

{{-- SIGNATORIES --}}
<div class="signature-block">
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Requester:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($offCampus->requester_name ?? '—') }}</p>
        <p style="font-size:11px;">Personnel</p>
    </div>

    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Approved By:</p>
        <div class="signature-line"></div>
        @if($offCampus->approved_by_name)
        <p style="font-weight:bold;">{{ strtoupper($offCampus->approved_by_name) }}</p>
        <p style="font-size:11px;">Dean / Head Concerned</p>
        @else
        <p style="color:#888;">—</p>
        <p style="font-size:11px;">Dean / Head Concerned</p>
        @endif
    </div>

    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Issued By:</p>
        <div class="signature-line"></div>
        @php $issued = $signatories['issued_by'] ?? null; @endphp
        @if($issued && $offCampus->issued_by_signed)
        <p style="font-weight:bold;">{{ strtoupper($issued->name ?? '—') }}</p>
        <p style="font-size:11px;">{{ $issued->title ?? 'Head, PMO' }}</p>
        @else
        <p style="color:#888;">—</p>
        <p style="font-size:11px;">Head, PMO</p>
        @endif
    </div>

    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Checked By:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($offCampus->checked_by ?? '—') }}</p>
        <p style="font-size:11px;">Chief, Security Service</p>
    </div>
</div>
@endsection