@component('mail::message')
# Verify your email

Hi {{ $name }},

Your verification code is:

# **{{ $otp }}**

This code expires in **10 minutes**.  
If you didn’t request this, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
