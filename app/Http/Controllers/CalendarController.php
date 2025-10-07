<?php

namespace App\Http\Controllers;

use App\Models\InventoryScheduling;
use App\Models\Transfer;
use App\Models\OffCampus;
use App\Models\TurnoverDisposal;
use App\Models\FormApproval;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function index()
    {
        // Inventory Scheduling
        $inventoryEvents = InventoryScheduling::with(['building', 'unitOrDepartment'])
            ->get()
            ->map(fn($i) => [
                'id' => 'inventory_' . $i->id,
                'title' => sprintf(
                    'Inventory Scheduling #%d: <b>%s</b> <b>%s</b>',
                    $i->id,
                    optional($i->building)->name ?? '',
                    optional($i->unitOrDepartment)->name ?? ''
                ),
                'start' => $i->actual_date_of_inventory
                    ? $i->actual_date_of_inventory
                    : Carbon::createFromFormat('Y-m', $i->inventory_schedule)->startOfMonth(),
                'end' => $i->actual_date_of_inventory
                    ? $i->actual_date_of_inventory
                    : Carbon::createFromFormat('Y-m', $i->inventory_schedule)->endOfMonth(),
                'type' => 'Inventory Scheduling',
                'status' => $i->scheduling_status,
                'color' => '#2563eb',
                'url' => route('inventory-scheduling.view', $i->id),
            ]);

        // Property Transfers
        $transferEvents = Transfer::with(['currentOrganization', 'receivingOrganization'])
            ->get()
            ->map(fn($t) => [
                'id' => 'transfer_' . $t->id,
                'title' => sprintf(
                    'Property Transfer #%d: <b>%s</b> → <b>%s</b>',
                    $t->id,
                    optional($t->currentOrganization)->name ?? '—',
                    optional($t->receivingOrganization)->name ?? '—'
                ),
                'start' => $t->scheduled_date,
                'end' => $t->actual_transfer_date ?? $t->scheduled_date,
                'type' => 'Property Transfer',
                'status' => $t->status,
                'color' => '#16a34a',
                'url' => route('transfers.view', $t->id),
            ]);

        // Off-Campus
        $offCampusEvents = OffCampus::with(['collegeOrUnit'])
            ->get()
            ->flatMap(fn($o) => [
                [
                    'id' => 'offcampus_' . $o->id . '_issue',
                    'title' => sprintf(
                        'Pending Return for Off-Campus #%d: <b>%s</b> of <b>%s</b>',
                        $o->id,
                        $o->requester_name ?? '—',
                        optional($o->collegeOrUnit)->name ?? '—'
                    ),
                    'start' => $o->date_issued,
                    'type' => 'Off-Campus Issued',
                    'status' => $o->status,
                    'color' => '#f59e0b',
                    'url' => route('off-campus.view', $o->id),
                ],
                [
                    'id' => 'offcampus_' . $o->id . '_return',
                    'title' => sprintf(
                        'Return Due for Off-Campus #%d: <b>%s</b> of <b>%s</b>',
                        $o->id,
                        $o->requester_name ?? '—',
                        optional($o->collegeOrUnit)->name ?? '—'
                    ),
                    'start' => $o->return_date,
                    'type' => 'Off-Campus Return',
                    'status' => $o->status,
                    'color' => '#eab308',
                    'url' => route('off-campus.view', $o->id),
                ],
            ]);

        // Turnover / Disposal
        $turnoverEvents = TurnoverDisposal::with(['issuingOffice', 'receivingOffice'])
            ->get()
            ->map(fn($d) => [
                'id' => 'turnover_' . $d->id,
                'title' => sprintf(
                    '%s #%d: <b>%s</b> → <b>%s</b>',
                    ucfirst($d->type),
                    $d->id,
                    optional($d->issuingOffice)->name ?? '—',
                    optional($d->receivingOffice)->name ?? '—'
                ),
                'start' => $d->document_date,
                'type' => 'Turnover/Disposal',
                'status' => $d->status,
                'color' => '#9333ea',
                'url' => route('turnover-disposal.view', $d->id),
            ]);

        // Form Approvals
        $approvalEvents = FormApproval::select('id', 'form_title', 'form_type', 'requested_at', 'reviewed_at', 'status')
            ->get()
            ->map(fn($a) => [
                'id' => 'approval_' . $a->id,
                'title' => sprintf(
                    'Pending Review for <b>%s</b> #%d',
                    ucwords(str_replace('_', ' ', $a->form_type)),
                    $a->id
                ),
                'start' => $a->requested_at,
                'end' => $a->reviewed_at,
                'type' => 'Form Approval',
                'status' => $a->status,
                'color' => '#dc2626',
                'url' => route('approvals.index'),
            ]);

        // Combine
        $events = collect()
            ->merge($inventoryEvents)
            ->merge($transferEvents)
            ->merge($offCampusEvents)
            ->merge($turnoverEvents)
            ->merge($approvalEvents)
            ->values();

        return Inertia::render('calendar', [
            'events' => $events,
        ]);
    }
}
