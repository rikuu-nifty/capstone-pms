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
        max-width: 200px;
        margin-left: -15px;
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

    /* === Remove unwanted outer signatory borders but keep inner ones === */
    table.signatories-outer {
        border: none !important;
        border-collapse: collapse;
    }

    table.signatories-outer>tbody>tr>td {
        border: none !important;
        background: transparent !important;
    }

    table.signatories-outer>tbody>tr:first-child>td {
        border-top: none !important;
    }

    table.signatories-outer>tbody>tr:last-child>td {
        border-bottom: none !important;
    }

    /* Add space between each inner signature table */
    table.signatories-outer>tbody>tr>td>table {
        margin-bottom: 14px;
        /* adjust for visual balance */
    }

    /* Vertically center the signatory labels beside their tables */
    table.signatories-outer>tbody>tr>td:first-child {
        vertical-align: middle !important;
    }

    /* Make signatory names bold but roles normal */
    table.signatories-outer td strong,
    table.signatories-outer td span.name {
        font-weight: bold;
        font-size: 11px;
    }

    table.signatories-outer td span.role {
        font-weight: normal;
        font-style: italic;
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
                <span class="label-text">Item/Unit:</span>
                <span class="value-line">&nbsp;</span>
            </div>

            <div class="label-row">
                <span class="label-text">Department:</span>
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
                <span class="label-text">Item/Unit:</span>
                <span class="value-line">&nbsp;</span>
            </div>

            <div class="label-row">
                <span class="label-text">Department:</span>
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

{{-- SIGNATORIES (no outer border; clean AUF format) --}}
<table class="signatories-outer" style="width:100%; border-collapse:collapse; font-size:12px; margin-top:40px;">
    {{-- Prepared By --}}
    <tr>
        <td style="width:18%; vertical-align:top; padding:6px 8px; font-weight:bold;">Prepared by:</td>
        <td style="width:82%; padding:0;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed;">
                <colgroup>
                    <col style="width:65%;">
                    <col style="width:15%;">
                    <col style="width:10%;">
                    <col style="width:10%;">
                </colgroup>
                <thead>
                    <tr>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Print or Type Name</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Signature</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Date</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Tel. Ext.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height:45px;">
                        <td style="border:1px solid #000; padding:6px; text-align:center;">
                            <span class="name">{{ strtoupper($transfer->assignedBy->name ?? '—') }}</span><br>
                            <span class="role" style="font-size:11px;">{{ $transfer->assignedBy->role->name ?? '' }}</span>
                        </td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </td>
    </tr>

    {{-- Reviewed/Checked & Approved By --}}
    <tr>
        <td style="width:18%; vertical-align:top; padding:6px 8px; font-weight:bold;">Reviewed/Checked &amp; Approved by:</td>
        <td style="width:82%; padding:0;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed;">
                <colgroup>
                    <col style="width:65%;">
                    <col style="width:15%;">
                    <col style="width:10%;">
                    <col style="width:10%;">

                </colgroup>
                <thead>
                    <tr>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Print or Type Name</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Signature</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Date</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Tel. Ext.</th>
                    </tr>
                </thead>
                <tbody>
                    @php $approvedSig = $signatories['approved_by'] ?? null; @endphp
                    <tr style="height:45px;">
                        <td style="border:1px solid #000; padding:6px; text-align:center;">
                            <span class="name">{{ strtoupper($approvedSig->name ?? '—') }}</span><br>
                            <span class="role" style="font-size:11px;">{{ $approvedSig->title ?? 'Head, Property Management' }}</span>
                        </td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </td>
    </tr>

    {{-- Received By --}}
    <tr>
        <td style="width:18%; vertical-align:top; padding:6px 8px; font-weight:bold;">Received by:</td>
        <td style="width:82%; padding:0;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed;">
                <colgroup>
                    <col style="width:65%;">
                    <col style="width:15%;">
                    <col style="width:10%;">
                    <col style="width:10%;">

                </colgroup>
                <thead>
                    <tr>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Print or Type Name</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Signature</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Date</th>
                        <th style="border:1px solid #000; text-align:center; padding:6px;">Tel. Ext.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height:45px;">
                        <td style="border:1px solid #000; padding:6px; text-align:center;">
                            <span class="name">{{ strtoupper($transfer->received_by ?? '—') }}</span><br>
                            <span style="font-size:11px;">{{ $transfer->received_by_title ?? '' }}</span>
                        </td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                        <td style="border:1px solid #000;">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </td>
    </tr>
</table>

@endsection