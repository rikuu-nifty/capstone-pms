@extends('emails.layout')

@section('title', 'Form Approval Needed')

@section('content')
<h2>Form Approval Needed</h2>

<p>Dear <strong>{{ $approverName }}</strong>,</p>

<p>
    A form titled <strong>{{ $formTitle }}</strong> requires your approval for the step:
    <strong>{{ $stepLabel }}</strong>.
</p>

<p>
    Please review and take action at your earliest convenience by clicking the button below.
</p>

<div class="button-container">
    <a href="{{ $approvalUrl }}" class="button">Review Now</a>
</div>

<p>
    Thank you for your prompt attention and continued support.
</p>
@endsection