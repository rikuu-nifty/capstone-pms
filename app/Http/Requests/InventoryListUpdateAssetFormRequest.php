<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryListUpdateAssetFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $inventoryList = $this->route('inventory_list'); // for ignore rule
        $mode = $this->input('mode', 'single');

        return [
            'building_id'          => ['nullable', 'exists:buildings,id'],
            'unit_or_department_id' => ['nullable', 'exists:unit_or_departments,id'],
            'building_room_id'     => ['nullable', 'exists:building_rooms,id'],
            'category_id'          => 'required|integer|exists:categories,id',
            'date_purchased'       => 'required|date',
            'asset_type'           => 'required|in:fixed,not_fixed',
            'asset_name'           => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_lists', 'asset_name')->ignore($inventoryList->id),
            ],
            'brand'                => 'required|string|max:255',
            'quantity'             => 'required|integer|min:1|max:1000',
            'supplier'             => 'required|string|max:255',
            'unit_cost'            => 'required|numeric|min:0|max:999999.99',
            'serial_no'            => 'nullable|string|max:255',
            'asset_model_id'       => 'required|integer|max:255',
            'description'          => 'nullable|string|max:1000',
            'memorandum_no'        => 'required|numeric|min:0',
            'status'               => 'required|in:active,archived,missing',
            'image'                => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'mode'                 => 'nullable|string|in:single,bulk',
            'depreciation_value'   => 'nullable|numeric|min:0',
            'assigned_to'          => 'nullable|exists:personnels,id',
            'sub_area_id'          => 'nullable|exists:sub_areas,id',
        ];
    }

    public function messages(): array
    {
        // ✅ just copy from InventoryListAddNewAssetFormRequest
        return (new InventoryListAddNewAssetFormRequest())->messages();
    }
}
