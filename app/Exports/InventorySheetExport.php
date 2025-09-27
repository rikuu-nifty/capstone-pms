<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class InventorySheetExport implements FromView
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function view(): View
    {
        return view('reports.exports.inventory-sheet-excel', [
            'assets' => $this->data['groupedAssets'],
            'filters' => $this->data['filters'],
        ]);
    }
}
