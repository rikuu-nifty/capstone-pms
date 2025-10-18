<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class PersonnelAssignmentsExport implements FromView
{
    public function __construct(public $data, public $filters) {}

    public function view(): View
    {
        return view('reports.personnel_assignments_excel', [
            'records' => $this->data,
            'filters' => $this->filters,
        ]);
    }
}
