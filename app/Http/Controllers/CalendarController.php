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
        $inventoryEvents = InventoryScheduling::select('id', 'inventory_schedule', 'actual_date_of_inventory', 'scheduling_status')
            ->get()
            ->map(fn($i) => [
                'id' => 'inventory_' . $i->id,
                'title' => 'Inventory #' . $i->id,
                'start' => $i->actual_date_of_inventory ?? Carbon::createFromFormat('Y-m', $i->inventory_schedule)->startOfMonth(),
                'end' => $i->actual_date_of_inventory ?? Carbon::createFromFormat('Y-m', $i->inventory_schedule)->endOfMonth(),
                'type' => 'Inventory Scheduling',
                'status' => $i->scheduling_status,
                'color' => '#2563eb',
                'url' => route('inventory-scheduling.view', $i->id),
            ]);

        $transferEvents = Transfer::select('id', 'scheduled_date', 'actual_transfer_date', 'status')
            ->get()
            ->map(fn($t) => [
                'id' => 'transfer_' . $t->id,
                'title' => 'Transfer #' . $t->id,
                'start' => $t->scheduled_date,
                'end' => $t->actual_transfer_date ?? $t->scheduled_date,
                'type' => 'Property Transfer',
                'status' => $t->status,
                'color' => '#16a34a',
                'url' => route('transfers.view', $t->id),
            ]);

        $offCampusEvents = OffCampus::select('id', 'date_issued', 'return_date', 'status')
            ->get()
            ->flatMap(fn($o) => [
                [
                    'id' => 'offcampus_' . $o->id . '_issue',
                    'title' => 'Issued: Off-Campus #' . $o->id,
                    'start' => $o->date_issued,
                    'type' => 'Off-Campus',
                    'status' => $o->status,
                    'color' => '#f59e0b',
                    'url' => route('off-campus.view', $o->id),
                ],
                [
                    'id' => 'offcampus_' . $o->id . '_return',
                    'title' => 'Return: Off-Campus #' . $o->id,
                    'start' => $o->return_date,
                    'type' => 'Off-Campus Return',
                    'status' => $o->status,
                    'color' => '#eab308',
                    'url' => route('off-campus.view', $o->id),
                ],
            ]);

        $turnoverEvents = TurnoverDisposal::select('id', 'document_date', 'status', 'type')
            ->get()
            ->map(fn($d) => [
                'id' => 'turnover_' . $d->id,
                'title' => ucfirst($d->type) . ' #' . $d->id,
                'start' => $d->document_date,
                'type' => 'Turnover/Disposal',
                'status' => $d->status,
                'color' => '#9333ea',
                'url' => route('turnover-disposal.view', $d->id),
            ]);

        $approvalEvents = FormApproval::select('id', 'form_title', 'form_type', 'requested_at', 'reviewed_at', 'status')
            ->get()
            ->map(fn($a) => [
                'id' => 'approval_' . $a->id,
                'title' => $a->form_title,
                'start' => $a->requested_at,
                'end' => $a->reviewed_at,
                'type' => 'Form Approval',
                'status' => $a->status,
                'color' => '#dc2626',
                'url' => route('approvals.index'),
            ]);

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
