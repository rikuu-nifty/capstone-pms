@extends('emails.layout')

@section('title', 'Account Request Denied')

@section('content')
<h2>Account Request Denied</h2>
<p>Hi <strong>{{ $name }}</strong>,</p>
<p>We’re sorry—your account request was <strong>Not Approved</strong>.</p>
<p>If you believe this is an error or need further clarification, please reach out to the administrator.</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">Go to Home</a>
</div>
@endsection