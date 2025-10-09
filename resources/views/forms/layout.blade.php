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
            /* font-weight: 500; */
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
            color: #444;
            text-align: right;
            padding-top: 5px;
            font-family: 'Times New Roman', Times, serif;
        }

        /* ---------- BODY ---------- */
        h2, h3 {
            margin: 0 0 8px;
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        th, td {
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
    </header>

    <main>
        @yield('content')
    </main>

    <footer>
        AUF-FORM-AS/PMO-33&nbsp;&nbsp;November 22, 2011&nbsp;&nbsp;Rev. 0
    </footer>

    @stack('pdf-scripts')
</body>

</html>
