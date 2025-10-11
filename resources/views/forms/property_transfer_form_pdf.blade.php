@extends('forms.layout')

@section('title', 'Property Transfer Sheet')

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

    /* --- TRANSFER SECTION  --- */
    table.transfer-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0 4px;
    }

    table.transfer-table td {
        vertical-align: top;
        padding: 0 12px 8px 12px;
        border: none !important;
        background: transparent !important;
    }

    table.transfer-table thead,
    table.transfer-table th {
        display: none;
    }

    /* avoid layout th styles */

    .tf-heading {
        text-align: center;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 20px;
        font-size: 13px;
        text-decoration: underline;
    }

    /* Inline-block alignment: labels all same width, values start at SAME x */
    .label-row {
        white-space: nowrap;
        margin: 0 0 12px 0;
        line-height: 1.2;
        font-size: 12px;
    }

    .label-text {
        display: inline-block;
        width: 110px;
    }

    .value-line {
        display: inline-block;
        vertical-align: baseline;
        border-bottom: 0.8px solid #000;
        padding: 0 0 1px 6px;
        min-width: 180px;
        margin-left: 5px;
        text-align: center;
    }

    /* --- Assets table --- */
    .assets-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-bottom: 10px;
        margin-top: -15px;
    }

    .assets-table th,
    .assets-table td {
        border: 1px solid #000;
        padding: 5px 8px;
        text-align: center;
    }

    /* --- Fix: AUF-style merged header for Property New Location --- */
    .assets-table th {
        font-weight: 600;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #000;
        padding: 4px 6px;
    }

    /* Proper AUF-style merged header with underline under "Property New Location" */
    .assets-table thead tr:first-child th {
        border-bottom: 1px solid #000;
        /* restores underline */
    }

    .assets-table thead tr:first-child th[colspan="2"] {
        border-bottom: 1px solid #000;
        /* ensures underline stays visible under merged cell */
        padding-bottom: 3px;
    }

    .assets-table thead tr:nth-child(2) th {
        border-top: none;
        /* clean merge */
        padding-top: 2px;
    }

    .assets-table thead tr:first-child th {
        border-bottom: none;
    }

    .assets-table thead tr:nth-child(2) th {
        border-top: none;
    }

    /* ensure header heights are balanced like the printed form */
    .assets-table thead tr:first-child th[colspan="2"] {
        padding-bottom: 2px;
    }

    .assets-table thead tr:nth-child(2) th {
        padding-top: 2px;
    }

    .remarks {
        margin-top: 10px;
        font-size: 12px;
    }

    .signature-block {
        margin-top: 50px;
        text-align: center;
        page-break-inside: avoid;
    }

    .signature-line {
        width: 170px;
        border-top: 1px solid #000;
        margin: 40px auto 4px;
    }

    /* Tighten spacing between signatory name and role/title */
    .signature-block p {
        margin: 2px 0;
        /* reduce all <p> vertical margins */
    }

    .signature-block p[style*="font-weight:bold"] {
        margin-bottom: 3px;
        /* tiny gap between name and role */
    }

    .assets-table td:nth-child(2),
    .assets-table td:nth-child(3),
    .assets-table td:nth-child(4) {
        white-space: normal;
        /* allows wrapping to multiple lines */
        word-break: break-word;
        /* breaks long words if needed */
        overflow-wrap: break-word;
        /* cross-browser compatibility */
        text-align: center;
        /* aligns text like printed AUF forms */
        vertical-align: top;
        /* top-align multi-line entries */
    }

    /* Kill the divider under "Code No.", "Description", and "Remarks" */
    .assets-table thead tr:nth-child(2) th:nth-child(1),
    .assets-table thead tr:nth-child(2) th:nth-child(2),
    .assets-table thead tr:nth-child(2) th:last-child {
        border-bottom: 0 !important;
        /* removes bottom border on row 2 */
    }

    /* Kill the divider for the empty cells below those same columns */
    .assets-table thead tr:nth-child(3) th:nth-child(1),
    .assets-table thead tr:nth-child(3) th:nth-child(2),
    .assets-table thead tr:nth-child(3) th:last-child {
        border-top: 0 !important;
        /* removes top border on row 3 */
    }
</style>
@endpush

@section('content')
@php
use Carbon\Carbon;
@endphp

{{-- HEADER --}}
<div class="header">
    <h3>Property Transfer Sheet</h3>
</div>

{{-- LOCATIONS (AUF-style: inline labels + uniform underlines) --}}
<table class="transfer-table">
    <tr>
        <td style="width:50%;">
            <div class="tf-heading">Transfer From</div>

            <div class="label-row">
                <span class="label-text">Item/Unit/Department:</span>
                <span class="value-line">{{ $transfer->currentOrganization->name ?? '' }}</span>
            </div>

            <div class="label-row">
                <span class="label-text">Date:</span>
                <span class="value-line">
                    {{ $transfer->scheduled_date ? \Carbon\Carbon::parse($transfer->scheduled_date)->format('F d, Y') : '' }}
                </span>
            </div>
        </td>

        <td style="width:50%;">
            <div class="tf-heading">Transfer To</div>

            <div class="label-row">
                <span class="label-text">Item/Unit/Department:</span>
                <span class="value-line">{{ $transfer->receivingOrganization->name ?? '' }}</span>
            </div>

            <div class="label-row">
                <span class="label-text">Date:</span>
                <span class="value-line">
                    {{ $transfer->actual_transfer_date ? \Carbon\Carbon::parse($transfer->actual_transfer_date)->format('F d, Y') : '' }}
                </span>
            </div>
        </td>
    </tr>
</table>

{{-- ASSETS --}}
<table class="assets-table">
    <thead>
        <tr class="spacer-row">
            <td colspan="5" style="height:10px; border:none; border-bottom:1px solid #000; background:#fff;"></td>
        </tr>
        <tr>
            <th style="width:15%;">Code No.</th>
            <th style="width:35%;">Description</th>
            <th colspan="2" style="width:30%;">Property New Location</th>
            <th style="width:20%;">Remarks</th>
        </tr>
        <tr>
            <th></th>
            <th></th>
            <th style="width:15%;">Building</th>
            <th style="width:15%;">Room No.</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $a)
        <tr>
            <td>{{ $a->asset->asset_model->equipment_code->code ?? '—' }}</td>
            <td>{{ $a->asset->asset_name }}{{ $a->asset->description ? ' - ' . $a->asset->description : '' }}</td>
            <td>{{ $transfer->receivingBuildingRoom->building->name ?? '—' }}</td>
            <td>{{ $transfer->receivingBuildingRoom->room ?? '—' }}</td>
            <td>
                @php
                $toSubAreaName = $a->toSubArea->name ?? null;
                $combinedRemarks = trim($a->remarks ?? $transfer->remarks ?? '');
                @endphp

                @if($combinedRemarks)
                {!! nl2br(e($combinedRemarks)) !!}
                @endif

                @if($toSubAreaName)
                @if($combinedRemarks)<br>@endif
                <span>To: {{ $toSubAreaName }}</span>
                @elseif(!$combinedRemarks)
                —
                @endif
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="5" style="text-align:center;">No associated assets.</td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- SIGNATORIES --}}
<div class="signature-block">
    {{-- Prepared By --}}
    @if($transfer->assignedBy)
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Prepared By:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($transfer->assignedBy->name) }}</p>
        <p style="font-size:11px;">
            {{ $transfer->assignedBy->role->name ?? '—' }}
        </p>
    </div>
    @endif

    {{-- Reviewed/Checked & Approved By --}}
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Reviewed/Checked & Approved By:</p>
        <div class="signature-line"></div>
        @php $approvedSig = $signatories['approved_by'] ?? null; @endphp
        @if($approvedSig)
        <p style="font-weight:bold;">{{ strtoupper($approvedSig->name ?? '—') }}</p>
        <p style="font-size:11px;">{{ $approvedSig->title ?? 'Head, Property Management' }}</p>
        @else
        <p style="color:#888;">—</p>
        <p style="font-size:11px;">Head, Property Management</p>
        @endif
    </div>

    {{-- Received By --}}
    @if(!empty($transfer->received_by))
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Received By:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($transfer->received_by) }}</p>
        {{-- optional role/title if available --}}
        @if(!empty($transfer->received_by_title))
        <p style="font-size:11px;">{{ $transfer->received_by_title }}</p>
        @endif
    </div>
    @endif
</div>
@endsection