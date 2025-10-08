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
                    '<b>Inventory Scheduling #%d</b>: <u>%s</u> in <u>%s</u>',
                    $i->id,
                    optional($i->unitOrDepartment)->name ?? '',
                    optional($i->building)->name ?? '',
                ),
            'start' => $i->actual_date_of_inventory
                ? $i->actual_date_of_inventory
                : Carbon::createFromFormat('Y-m', $i->inventory_schedule)->startOfMonth(),
            'end' => $i->actual_date_of_inventory
                ? $i->actual_date_of_inventory
                : Carbon::createFromFormat('Y-m', $i->inventory_schedule)->endOfMonth()->addDay(),
            'type' => 'Inventory Scheduling',
                'status' => $i->scheduling_status,
                'color' => '#3d5ea5ff',
                'url' => route('inventory-scheduling.view', $i->id),
                'allDay' => true,
            ]);

        // Property Transfers
        $transferEvents = Transfer::with(['currentOrganization', 'receivingOrganization'])
            ->get()
            ->map(fn($t) => [
                'id' => 'transfer_' . $t->id,
                'title' => sprintf(
                    '<b>Property Transfer #%d</b>: <u>%s</u> to <u>%s</u>',
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
            // THIS IS FOR THE ISSUED DATE
            [
                'id' => 'offcampus_' . $o->id . '_issue',
                'title' => sprintf(
                    '<b>Pending Return</b> for <b>Off-Campus #%d</b>: Requested by <u>%s</u> of <u>%s</u>',
                    $o->id,
                    $o->requester_name ?? '—',
                    optional($o->collegeOrUnit)->name ?? '—'
                ),
                'start' => $o->date_issued,
                'type' => 'Off-Campus Issued',
                'status' => $o->status,
                'color' => '#f59e0b',
                'url' => route('off-campus.view', $o->id),
                    'allDay' => true,
            ],
            [
                'id' => 'offcampus_' . $o->id . '_return',
                'title' => sprintf(
                    '<b>Return Due</b> for <b>Off-Campus #%d</b>: <u>%s</u> of <u>%s</u>',
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
                    '<b>%s #%d</b>: <u>%s</u> to <u>%s</u>',
                    ucfirst($d->type),
                    $d->id,
                    optional($d->issuingOffice)->name ?? '—',
                    optional($d->receivingOffice)->name ?? '—'
                ),
                'start' => $d->document_date,
                'type' => 'Turnover/Disposal',
                'status' => $d->status,
                'color' => '#8c56beff',
                'url' => route('turnover-disposal.view', $d->id),
            ]);

        // Form Approvals
        $approvalEvents = FormApproval::select('id', 'form_title', 'form_type', 'requested_at', 'reviewed_at', 'status')
            ->get()
            ->map(fn($a) => [
                'id' => 'approval_' . $a->id,
                'title' => sprintf(
                    '<b>Form Approval</b>: <i>%s</i> #%d',
                    ucwords(str_replace('_', ' ', $a->form_type)),
                    $a->id
                ),
                'start' => $a->requested_at,
                'end' => $a->reviewed_at,
                'type' => 'Form Approval',
                'status' => $a->status,
                'color' => '#f03434ff',
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
