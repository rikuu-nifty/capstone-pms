<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>@yield('title') - {{ config('app.name') }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f5f6fa;
            margin: 0;
            padding: 0;
            color: #333;
        }

        .email-wrapper {
            width: 100%;
            padding: 40px 0;
            background-color: #f5f6fa;
        }

        .email-content {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        /* HEADER */
        .email-header {
            background-color: #0056D2;
            text-align: left;
            padding: 0;
            min-height: 80px;
        }

        .email-header table {
            border-collapse: collapse;
            width: 100%;
            height: 80px;
        }

        .email-header img {
            display: block;
            width: 200px;
            max-width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            border: 0;
            line-height: 0;
        }

        /* BODY */
        .email-body {
            padding: 30px 40px;
            min-height: 325px;
        }

        .email-body h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0056D2;
            margin-bottom: 16px;
            text-align: center;
        }

        .email-body p {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #444;
            text-align: justify;
        }

        .email-body p:first-of-type {
            text-align: left;
        }

        .button {
            display: inline-block;
            background: #0056D2;
            color: #fff !important;
            text-decoration: none;
            padding: 10px 22px;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 12px;
        }

        .button-container {
            text-align: center;
            margin-top: 10px;
        }

        /* FOOTER */
        .email-footer {
            background-color: #0056D2;
            color: #ffffff;
            padding: 16px 30px;
            font-size: 13px;
            min-height: 70px;
        }

        .email-footer p {
            margin: 0;
            line-height: 1.5;
        }

        .email-footer strong {
            color: #ffffff;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="email-content">
            <!-- HEADER -->
            <div class="email-header">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                    style="border-collapse:collapse; width:100%; height:80px;">
                    <tr style="height:80px;">
                        <td align="left" valign="middle" style="padding:20px;">
                            <!-- <img
                                src="{{ isset($message)
                                    ? $message->embed(public_path('images/email-logo.png'))
                                    : config('app.url') . '/images/email-logo.png' }}"
                                alt="Angeles University Foundation"
                                style="display:block; width:200px; max-width:100%; height:auto; margin:0; padding:0; border:0;"
                            /> -->
                            <img
                                src="https://tapandtrackfiles.s3.ap-southeast-1.amazonaws.com/logo_image/email-logo.png"
                                alt="Angeles University Foundation"
                                style="display:block; width:200px; max-width:100%; height:auto; margin:0; padding:0; border:0;" />

                        </td>
                    </tr>
                </table>
            </div>

            <!-- BODY -->
            <div class="email-body">
                @yield('content')
            </div>

            <!-- FOOTER -->
            <div class="email-footer">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                    style="border-collapse:collapse; width:100%; height:70px;">
                    <tr style="height:70px;">
                        <td align="center" valign="middle" style="text-align:left; padding:0; margin:0;">
                            <p style="margin:0; line-height:1.5;">
                                Thank you, <strong>Tap & Track</strong>.
                            </p>
                            <p style="margin:6px 0 0 0; line-height:1.5; font-style:italic;">
                                © {{ date('Y') }} Angeles University Foundation. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>

</html>