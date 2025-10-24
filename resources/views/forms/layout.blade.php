<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Form')</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 120px 40px 60px 40px;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            color: #000;
            line-height: 1.4;
        }

        * {
            font-family: inherit;
            color: inherit;
        }

        /* ---------- HEADER ---------- */
        header {
            position: fixed;
            top: -75px;
            left: 0;
            right: 0;
            height: 80px;
            text-align: center;
            padding: 5px 20px 0;
        }

        header .logo {
            position: absolute;
            top: 0;
            left: 10px;
            width: 50px;
            height: auto;
        }

        header .header-text {
            text-align: center;
            line-height: 1.2;
        }

        header .header-right {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 13px;
            font-weight: bold;
            text-align: right;
        }

        header .header-text h1 {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        header .header-text p.city {
            margin: 2px 0;
            font-size: 12px;
            font-style: italic;
        }

        header .header-text p.office {
            margin: 2px 0 0;
            font-size: 15px;
        }

        main {
            margin-top: 10px;
        }

        /* ---------- FOOTER ---------- */
        footer {
            position: fixed;
            bottom: -40px;
            left: 0;
            right: 0;
            height: 30px;
            font-size: 10px;
            color: #000;
            padding-top: 5px;
            font-family: 'Times New Roman', Times, serif;
        }

        footer .footer-left {
            position: absolute;
            left: 0;
        }

        footer .footer-left div+div {
            margin-top: 2px;
        }

        footer .footer-right {
            position: absolute;
            right: 0;
        }

        /* ---------- BODY ---------- */
        h2,
        h3 {
            margin: 0 0 8px;
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            vertical-align: middle;
        }

        th {
            background: #f3f3f3;
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .gray-bg {
            background: #f8f8f8;
        }

        .bordered {
            border: 1px solid #999;
        }

        .bordered th,
        .bordered td {
            border: 1px solid #999;
        }

        .section-title {
            font-weight: bold;
            text-transform: uppercase;
            margin: 12px 0 6px;
            font-size: 12px;
        }

        .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin: 40px auto 4px;
        }
    </style>

    @stack('styles')
</head>

<body>
    <header>
        <img src="{{ public_path('images/auflogo.jpg') }}" alt="AUF Logo" class="logo" />
        <div class="header-text">
            <h1>ANGELES UNIVERSITY FOUNDATION</h1>
            <p class="city">Angeles City</p>
            <p class="office">Office of the Administrative Services</p>
        </div>

        {{-- Optional right-aligned header content --}}
        @hasSection('header-right')
        <div class="header-right">
            @yield('header-right')
        </div>
        @endif
    </header>

    <main>
        @yield('content')
    </main>

    <footer>
        @if (!View::hasSection('hide-footer-text'))
        <div class="footer-left">
            <div>AUF-FORM-AS/PMO-33</div>
            <div>November 22, 2011&nbsp;&nbsp;Rev. 0</div>
        </div>
        @endif
        <div class="footer-right">
            {{-- Page number placeholder --}}
        </div>
    </footer>

    {{-- === PAGE NUMBER SCRIPT === --}}
    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_script('
                $font = $fontMetrics->get_font("Times New Roman", "normal");
                $size = 9;

                // Static total page capture
                static $totalPages;
                if (!$totalPages) {
                    $totalPages = $PAGE_COUNT;
                }

                // Left footer text stays fixed (already in HTML)
                $text = sprintf("Page %d of %d", $PAGE_NUM, $totalPages);
                $width = $fontMetrics->get_text_width($text, $font, $size);

                // Right side position (match footer-right)
                $x = $pdf->get_width() - $width - 40;
                $y = $pdf->get_height() - 40;

                $pdf->text($x, $y, $text, $font, $size, [0,0,0]);
            ');
        }
    </script>

    @stack('pdf-scripts')
</body>

</html>