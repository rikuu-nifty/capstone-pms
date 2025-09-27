<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Report')</title>
    <style>
        @page {
            margin: 100px 40px 60px 40px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
            line-height: 1.4;
        }

        /* ---------- HEADER ---------- */
        header {
            position: fixed;
            top: -80px;
            left: 0;
            right: 0;
            height: 80px;
            text-align: center;
            padding: 10px 20px;
        }

        header .logo {
            position: absolute;
            top: 2px;
            left: 5px;
            width: 70px;
            height: 90px;
        }

        header .header-text h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #000;
        }

        header .header-text p {
            margin: 0;
            padding: 0;
            line-height: 1.2;
            font-size: 11px;
            color: #000;
        }

        header .header-text p.muted {
            margin-top: 2px;
            color: #666;
        }

        /* ---------- FOOTER ---------- */
        footer {
            position: fixed;
            bottom: -40px;
            left: 0;
            right: 0;
            height: 30px;
            font-size: 10px;
            color: #666;
            text-align: center;
            padding-top: 5px;
        }

        /* ---------- TABLE ---------- */
        h2,
        h3 {
            margin: 0 0 8px;
        }

        h3 {
            color: #000;
        }

        .muted {
            color: #666;
        }

        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            background: #f3f4f6;
            color: #000;
            font-size: 10px;
            margin-right: 4px;
        }

        table {
            width: 100%;
            margin-top: 1px;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            vertical-align: middle;
        }

        th {
            background: #f3f4f6;
            font-weight: 700;
            text-align: left;
        }

        thead th {
            border-bottom: 2px solid #d1d5db;
        }

        tbody tr:nth-child(odd) {
            background: #fbfbfb;
        }

        .totals {
            margin-top: 8px;
            font-size: 12px;
        }

        .totals strong {
            color: #111;
        }

        .no-filters {
            font-size: 12px;
            color: #666;
            margin: 8px 0;
            font-style: italic;
        }
    </style>
    {{-- Allow page-specific overrides --}}
    @stack('styles')
</head>

<body>
    <header>
        <img src="{{ public_path('images/auflogo.jpg') }}" alt="AUF Logo" class="logo" />
        <div class="header-text">
            <h1>ANGELES UNIVERSITY FOUNDATION</h1>
            <p>Angeles City</p>
            <p>Property Management Office</p>
            <p class="muted">Generated: {{ now()->format('F d, Y h:i A') }}</p>
        </div>
    </header>

    <main>
        {{-- Default section for content --}}
        @yield('content')

        <!-- {{-- Optional: if a report includes $filters, show fallback
        @isset($filters)
            @if (collect($filters)->filter()->isEmpty())
                <p class="no-filters">No Filters Applied – showing all available records.</p>
            @endif
        @endisset --}}
    </main>

    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_script('
                $font = $fontMetrics->get_font("DejaVu Sans", "normal");
                $size = 9;

                // Capture total pages only once
                static $totalPages;
                if (!$totalPages) {
                    $totalPages = $PAGE_COUNT;
                }

                // Always use the static $totalPages to avoid stacking
                $text = sprintf("Page %d of %d", $PAGE_NUM, $totalPages);

                $width = $fontMetrics->get_text_width($text, $font, $size);
                $x = ($pdf->get_width() - $width) / 2;
                $y = $pdf->get_height() - 50;

                $pdf->text($x, $y, $text, $font, $size, [0,0,0]);
            ');
        }
    </script>
    {{-- Allow child views to inject PDF scripts --}}
    @stack('pdf-scripts')


</body>

</html>