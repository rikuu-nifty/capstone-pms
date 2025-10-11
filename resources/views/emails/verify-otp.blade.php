<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - {{ config('app.name') }}</title>
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

        .email-header {
            background-color: #0056D2;
            /* AUF Blue */
            text-align: center;
            padding: 24px 20px;
        }

        .email-header img {
            width: 80px;
            height: auto;
            margin-bottom: 10px;
        }

        .email-header h1 {
            color: #ffffff;
            font-size: 20px;
            margin: 0;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .email-body {
            padding: 30px 40px;
            text-align: center;
        }

        .email-body h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0056D2;
            margin-bottom: 16px;
        }

        .email-body p {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #444;
        }

        .otp-box {
            display: inline-block;
            background-color: #f0f6ff;
            border: 2px dashed #0056D2;
            border-radius: 8px;
            padding: 14px 28px;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #0056D2;
            margin-bottom: 20px;
        }

        .note {
            font-size: 13px;
            color: #555;
            background-color: #f9f9f9;
            padding: 10px 16px;
            border-radius: 8px;
            margin-top: 20px;
            line-height: 1.5;
        }

        .email-footer {
            background-color: #0056D2;
            /* Match header color */
            color: #ffffff;
            padding: 16px 30px;
            text-align: center;
            font-size: 13px;
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
                <img src="{{ asset('images/auflogo2.jpg') }}" alt="AUF Logo">
                <h1>Angeles University Foundation</h1>
            </div>

            <!-- BODY -->
            <div class="email-body">
                <h2>Verify Your Email</h2>
                <p>Hi <strong>{{ $name }}</strong>,</p>
                <p>Your verification code is:</p>

                <div class="otp-box">{{ $otp }}</div>

                <p>This code will expire in <strong>10 minutes</strong>.<br>
                    If you didn’t request this, you can safely ignore this email.</p>

                <div class="note">
                    You are receiving this email because you registered an account in
                    <strong>Tap&Track</strong>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="email-footer">
                <p>Thank you,<br>Property Management Office</p>
                <p>© {{ date('Y') }} Angeles University Foundation. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>