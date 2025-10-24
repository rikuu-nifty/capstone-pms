@php
use Carbon\Carbon;

/* ------- Format Filters ------- */
$from = $filters['from'] ?? null;
$to = $filters['to'] ?? null;
$fromDate = $from ? Carbon::parse($from) : null;
$toDate = $to ? Carbon::parse($to) : null;

$reportPeriod = '—';
if ($fromDate && $toDate) $reportPeriod = $fromDate->format('F d, Y') . ' – ' . $toDate->format('F d, Y');
elseif ($fromDate) $reportPeriod = $fromDate->format('F d, Y') . ' – Present';
elseif ($toDate) $reportPeriod = 'Until ' . $toDate->format('F d, Y');

/* ------- Group: Month → Issuing Office ------- */
$grouped = collect($donationSummary)
->groupBy(fn($r) => $r->document_date ? Carbon::parse($r->document_date)->format('F Y') : 'Undated')
->map(fn($monthItems) =>
$monthItems->groupBy(fn($r) => trim(strtoupper($r->issuing_office ?? '—')))
);

function formatPeso($amount) {
return '₱ ' . number_format((float)$amount, 2, '.', ', ');
}
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
    <td style="font-weight:bold;">Report Title:</td>
    <td colspan="3">Donation Summary Report</td>
    <td style="font-weight:bold;">Date Range:</td>
    <td colspan="3">{{ $reportPeriod }}</td>
</tr>

<tr>
    <td style="font-weight:bold;">Generated:</td>
    <td colspan="7">{{ now()->format('F d, Y') }}</td>
</tr>

<tr>
    <td colspan="8"></td>
</tr> {{-- spacer --}}

{{-- ================= MAIN TABLE ================= --}}
<table>
    <thead>
        <tr>
            <th>RECORD #</th>
            <th>DATE OF DONATION</th>
            <th>ISSUING OFFICE</th>
            <th>RECIPIENT</th>
            <th>ASSET NAME</th>
            <th>TURNOVER CATEGORY</th>
            <th>UNIT COST</th>
            <th>REMARKS</th>
        </tr>
    </thead>
    <tbody>
        @php
        $grandCount = 0;
        $grandCost = 0;
        @endphp

        @foreach ($grouped as $month => $offices)
        {{-- === Month Header === --}}
        <tr>
            <td colspan="8" style="font-weight:bold; background:#EAEAEA;">{{ $month }}</td>
        </tr>

        @foreach ($offices as $office => $rows)
        {{-- === Office Header === --}}
        <tr>
            <td colspan="8" style="font-weight:bold; background:#F5F5F5;">
                Issuing Office: {{ $office ?? '—' }}
            </td>
        </tr>

        @php
        $officeCount = 0;
        $officeCost = 0;
        @endphp

        {{-- === Data Rows === --}}
        @foreach ($rows as $r)
        @php
        $unitCost = (float) ($r->unit_cost ?? 0);
        $officeCount++;
        $officeCost += $unitCost;
        $grandCount++;
        $grandCost += $unitCost;

        // Build Asset Name cell: "Name (Category)\nSN: 123"
        $assetNameLines = [];
        $namePart = trim(($r->asset_name ?? '—') . (isset($r->category) && $r->category ? " ({$r->category})" : ''));
        $assetNameLines[] = $namePart !== '' ? $namePart : '—';
        if (!empty($r->serial_no)) $assetNameLines[] = "SN: {$r->serial_no}";
        $assetNameCell = implode("\n", $assetNameLines);
        @endphp
        <tr>
            <td>{{ $r->record_id }}</td>
            <td>{{ $r->document_date ? Carbon::parse($r->document_date)->format('M d, Y') : '—' }}</td>
            <td>{{ $r->issuing_office ?? '—' }}</td>
            <td>{{ $r->receiving_office ?? $r->external_recipient ?? '—' }}</td>
            <td>{{ $assetNameCell }}</td>
            <td>{{ $r->turnover_category ? ucfirst(str_replace('_', ' ', $r->turnover_category)) : '—' }}</td>
            <td>{{ formatPeso($r->unit_cost ?? 0) }}</td>
            <td>{{ $r->asset_remarks ?? '—' }}</td>
        </tr>
        @endforeach

        {{-- === Office Subtotals === --}}
        <tr>
            <td colspan="8" style="text-align:right; font-weight:bold;">
                Total Donations ({{ $office }}): {{ number_format($officeCount) }}
            </td>
        </tr>
        <tr>
            <td colspan="8" style="text-align:right; font-weight:bold;">
                Total Cost ({{ $office }}): {{ formatPeso($officeCost) }}
            </td>
        </tr>
        @endforeach
        @endforeach

        @if($grandCount === 0)
        <tr>
            <td colspan="8" style="text-align:center; padding:10px;">
                No donation records found.
            </td>
        </tr>
        @endif
    </tbody>
</table>

{{-- ================= SUMMARY ================= --}}
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
        Total Donation Records: {{ number_format($grandCount) }}
    </td>
</tr>
<tr>
    <td colspan="8" style="text-align:right; font-weight:bold;">
        Grand Total Cost: {{ formatPeso($grandCost) }}
    </td>
</tr>