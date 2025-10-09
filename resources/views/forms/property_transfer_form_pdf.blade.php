@extends('forms.layout')

@section('title', 'Property Transfer Sheet')

@push('styles')
<style>

.header { 
    text-align:center;
    margin-bottom:30px;
}

.header h3 { 
    font-size:14px; 
    font-weight:700; 
    text-decoration:underline;
}

/* --- TRANSFER SECTION  --- */
table.transfer-table { 
    width:100%; 
    border-collapse:collapse; 
    margin:8px 0 12px;
}

table.transfer-table td { 
    vertical-align:top; 
    padding:0 12px 8px 12px; 
    border:none !important; 
    background:transparent !important;
}

table.transfer-table thead, table.transfer-table th { 
    display:none;
} /* avoid layout th styles */

.tf-heading {
    text-align:center; 
    font-weight:700; 
    text-transform:uppercase; 
    margin-bottom:12px;
    font-size: 13px;
    text-decoration: underline;
}

/* Inline-block alignment: labels all same width, values start at SAME x */
.label-row { 
    white-space:nowrap;
    margin:0 0 6px 0; 
    line-height:1.2;
    font-size: 12px;
}
.label-text { 
    display:inline-block;
    width:110px;
}
.value-line {
    display:inline-block; 
    vertical-align:baseline;
    border-bottom:0.8px solid #000; 
    padding:0 0 1px 6px;
    min-width:180px;
    margin-left: 5px;
    text-align: center;
}

/* --- Assets table --- */
.section-title { 
    text-align:left; 
    font-weight:700; 
    text-transform:uppercase; 
    font-size:12px; 
    margin:10px 0 4px; 
}

.assets-table { 
    width:100%; 
    border-collapse:collapse; 
    font-size:12px; 
    margin-bottom:10px;
}

.assets-table th,.assets-table td { 
    border:1px solid #000; 
    padding:5px 8px; 
    text-align:center; 
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
    border-bottom: 1px solid #000; /* restores underline */
}

.assets-table thead tr:first-child th[colspan="2"] {
    border-bottom: 1px solid #000; /* ensures underline stays visible under merged cell */
    padding-bottom: 3px;
}

.assets-table thead tr:nth-child(2) th {
    border-top: none; /* clean merge */
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
    margin-top:10px; 
    font-size:12px; 
}
.signature-block { 
    margin-top:50px; 
    text-align:center; 
    page-break-inside:avoid;
}

.signature-line { 
    width:200px; 
    border-top:1px solid #000; 
    margin:40px auto 4px; 
}

.assets-table td:nth-child(2),
.assets-table td:nth-child(3),
.assets-table td:nth-child(4) {
    white-space: normal;       /* allows wrapping to multiple lines */
    word-break: break-word;    /* breaks long words if needed */
    overflow-wrap: break-word; /* cross-browser compatibility */
    text-align: center;          /* aligns text like printed AUF forms */
    vertical-align: top;       /* top-align multi-line entries */
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
        <!-- <tr class="thead-spacer">
            <th colspan="4">&nbsp;</th>
        </tr> -->
        <tr class="spacer-row">
            <td colspan="4" style="height:20px; border:none; background:#fff;"></td>
        </tr>
        <tr>
            <th style="width:15%;">Code No.</th>
            <th style="width:45%;">Description</th>
            <th colspan="2" style="width:40%;">Property New Location</th>
        </tr>
        <tr>
            <th></th>
            <th></th>
            <th style="width:20%;">Building</th>
            <th style="width:20%;">Room No.</th>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $a)
        <tr>
            <td>{{ $a->asset_model->equipment_code->code ?? '—' }}</td>
            <td>{{ $a->asset_name }}{{ $a->description ? ' - ' . $a->description : '' }}</td>
            <td>{{ $transfer->receivingBuildingRoom->building->name ?? '—' }}</td>
            <td>{{ $transfer->receivingBuildingRoom->room ?? '—' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="4" style="text-align:center;">No associated assets.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- <p style="font-size:12px;">
    <strong>Total Assets:</strong> {{ count($assets) }}
</p> -->

@if($transfer->remarks)
<p class="remarks"><strong>Remarks:</strong> {{ $transfer->remarks }}</p>
@endif

{{-- SIGNATORIES --}}
<div class="signature-block">
    {{-- Prepared By --}}
    @if($transfer->assignedBy)
    <div style="display:inline-block; width:30%; vertical-align:top;">
        <p>Prepared By:</p>
        <div class="signature-line"></div>
        <p style="font-weight:bold;">{{ strtoupper($transfer->assignedBy->name) }}</p>
        <p style="font-size:10px; color:#555;">
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
            <p style="font-size:10px; color:#555;">{{ $approvedSig->title ?? 'Head, Property Management' }}</p>
        @else
            <p style="color:#888;">—</p>
            <p style="font-size:10px; color:#555;">Head, Property Management</p>
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
            <p style="font-size:10px; color:#555;">{{ $transfer->received_by_title }}</p>
        @endif
    </div>
    @endif
</div>
@endsection
