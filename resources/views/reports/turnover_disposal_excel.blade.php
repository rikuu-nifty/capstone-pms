@php
use Carbon\Carbon;

/* Group: Month → Issuing Office → Type */
$grouped = collect($records)
->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated')
->map(fn($monthItems) =>
$monthItems->groupBy(fn($r) => trim(strtoupper($r->issuing_office ?? '—')))
->map(fn($officeItems) => $officeItems->groupBy('type'))
);

$i = 1;

// Format report period
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');
@endphp

{{-- ================= HEADER ================= --}}
<tr>
    <td colspan="8" style="font-weight:bold; text-align:center; font-size:14px; padding:6px;">
        Office of the Administrative Services
    </td>
</tr>

<tr>
    <td colspan="8"></td>
</tr> {{-- spacer --}}

{{-- Report Details --}}
<tr>
    <td style="font-weight:bold;">Issuing Office (Filter):</td>
    <td colspan="3">
        {{ !empty($filters['issuing_office_id'] ?? null) 
            ? optional(\App\Models\UnitOrDepartment::find($filters['issuing_office_id']))->name 
            : '—' }}
    </td>
    <td style="font-weight:bold;">Receiving Office (Filter):</td>
    <td colspan="3">
        {{ !empty($filters['receiving_office_id'] ?? null) 
            ? optional(\App\Models\UnitOrDepartment::find($filters['receiving_office_id']))->name 
            : '—' }}
    </td>
</tr>
<tr>
    <td style="font-weight:bold;">Type:</td>
    <td colspan="3">{{ !empty($filters['type'] ?? null) ? ucfirst($filters['type']) : '—' }}</td>
    <td style="font-weight:bold;">Date:</td>
    <td colspan="3">{{ $reportPeriod }}</td>
</tr>

<tr>
    <td colspan="8"></td>
</tr> {{-- spacer --}}

{{-- ================= MAIN TABLE ================= --}}
<table>
    <thead>
        <tr>
            <th>RECORD #</th>
            <th>ASSET NAME (TYPE)</th>
            <th>SERIAL NO.</th>
            <th>RECEIVING OFFICE</th>
            <th>UNIT COST</th>
            <th>STATUS</th>
            <th>DOCUMENT DATE</th>
            <th>REMARKS</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($grouped as $month => $offices)
        {{-- Month header --}}
        <tr>
            <td colspan="8">{{ $month }}</td>
        </tr>

        @foreach ($offices as $office => $types)
        {{-- Issuing Office --}}
        <tr>
            <td colspan="8">Issuing Office: {{ $office }}</td>
        </tr>

        @foreach ($types as $type => $rows)
        {{-- Type --}}
        <tr>
            <td colspan="8">{{ ucfirst($type) }}</td>
        </tr>

        {{-- Data Rows --}}
        @foreach ($rows as $r)
        <tr>
            <td>{{ $i++ }}</td>
            <td>{{ $r->asset_name ?? '—' }} ({{ $r->category ?? '—' }})</td>
            <td>{{ $r->serial_no ?? '—' }}</td>
            <td>{{ $r->receiving_office ?? '—' }}</td>
            <td>
                {{ isset($r->unit_cost) ? '₱ ' . number_format((float)$r->unit_cost, 2) : '—' }}
            </td>
            <td>{{ ucfirst($r->asset_status ?? $r->td_status ?? '—') }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td>{{ $r->remarks ?? '—' }}</td>
        </tr>
        @endforeach
        @endforeach

        {{-- Subtotals per Office --}}
        @php $officeAssets = $types->flatten(1); @endphp
        <tr>
            <td colspan="8" style="text-align:right; font-weight:bold;">
                Total Assets ({{ $office }}): {{ number_format($officeAssets->count()) }}
            </td>
        </tr>
        <tr>
            <td colspan="8" style="text-align:right; font-weight:bold;">
                Total Cost ({{ $office }}): ₱ {{ number_format($officeAssets->sum(fn($r) => (float) ($r->unit_cost ?? 0)), 2) }}
            </td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
</table>

{{-- ================= OVERALL SUMMARY ================= --}}
@php
$totalTurnovers = collect($records)->where('type','turnover')->count();
$totalDisposals = collect($records)->where('type','disposal')->count();
$totalAssets = collect($records)->count();
$totalCost = collect($records)->sum(fn($r) => (float) ($r->unit_cost ?? 0));
@endphp

<tr>
    <td colspan="8"></td>
</tr>
<tr style="background:#e2e8f0; font-weight:bold;">
    <td colspan="8" style="text-align:center; padding:8px; font-size:13px;">
        SUMMARY
    </td>
</tr>
<tr>
    <td colspan="8" style="text-align:right; font-weight:bold;">
        TOTAL TURNOVERS: {{ number_format($totalTurnovers) }}
    </td>
</tr>
<tr>
    <td colspan="8" style="text-align:right; font-weight:bold;">
        TOTAL DISPOSALS: {{ number_format($totalDisposals) }}
    </td>
</tr>
<tr>
    <td colspan="8" style="text-align:right; font-weight:bold;">
        TOTAL ASSETS: {{ number_format($totalAssets) }}
    </td>
</tr>
<tr>
    <td colspan="8" style="text-align:right; font-weight:bold;">
        TOTAL COST: ₱ {{ number_format($totalCost, 2) }}
    </td>
</tr>