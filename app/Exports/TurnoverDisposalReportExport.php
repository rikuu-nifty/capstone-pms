<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class TurnoverDisposalReportExport implements FromView
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function view(): View
    {
        return view('reports.exports.turnover-disposal-excel', [
            'records' => $this->data['records'],
            'filters' => $this->data['filters'],
        ]);
    }
}
