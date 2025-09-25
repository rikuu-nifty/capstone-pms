<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Turnover/Disposal Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        h2 {
            margin-bottom: 0;
        }

        .subtitle {
            font-size: 11px;
            color: #555;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .group-header {
            background-color: #eaeaea;
            font-weight: bold;
            padding: 8px;
        }

        .room-header {
            background-color: #f9f9f9;
            font-style: italic;
            padding: 6px;
        }
    </style>
</head>

<body>
    <h2>AUF Property Management Office</h2>
    <p class="subtitle">
        Turnover/Disposal Report
        @if(!empty($filters['from']) && !empty($filters['to']))
        ({{ $filters['from'] }} to {{ $filters['to'] }})
        @endif
    </p>

    @php
    // Group records by Department → Room
    $grouped = collect($records)->groupBy(function($r) {
    return $r['issuing_office'] ?? 'Unspecified Department';
    })->map(function($items) {
    return collect($items)->groupBy(function($r) {
    return $r['receiving_office'] ?? 'Unspecified Room';
    });
    });
    @endphp

    @foreach($grouped as $dept => $rooms)
    <div class="group-header">Department: {{ $dept }}</div>

    @foreach($rooms as $room => $rows)
    <div class="room-header">→ Receiving Office / Room: {{ $room }}</div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Issuing Code</th>
                <th>Receiving Code</th>
                <th>Asset Count</th>
                <th>Document Date</th>
                <th>Status</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $r)
            <tr>
                <td>{{ $r['id'] }}</td>
                <td>{{ $r['type'] }}</td>
                <td>{{ $r['issuing_code'] ?? '—' }}</td>
                <td>{{ $r['receiving_code'] ?? '—' }}</td>
                <td>{{ $r['asset_count'] }}</td>
                <td>{{ $r['document_date'] }}</td>
                <td>{{ ucfirst($r['status']) }}</td>
                <td>{{ $r['remarks'] ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endforeach
    @endforeach
</body>

</html>