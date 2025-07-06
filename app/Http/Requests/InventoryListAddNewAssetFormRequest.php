<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;


class InventoryListAddNewAssetFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'building' =>  'nullable|string|max:255',
            'unit_or_department' =>  'nullable|string|max:255',
            'building_room' => 'nullable|string|max:255',
            'date_purchased' => 'required|date',
            'asset_type' =>  'required|string|max:255',
            'asset_name' =>  'required|string|max:255',
            'brand' =>       'required|string|max:255',
            'quantity' =>    'required|integer|min:1|max:1000',
            'supplier' =>    'required|string|max:255',
            'unit_cost' =>   'required|numeric|min:0|max:999999.99',
            'serial_no' =>   'required|numeric|min:0',
            'asset_model_id' =>  'nullable|integer|max:255',
            'transfer_status' => 'nullable|in:not_transferred,transferred,pending',
            'description' =>     'nullable|string|max:1000',
            'memorandum_no' =>  'required|numeric|min:0',
        ];
    }


    /**
     * Function: Messages
     * @return array
     */
    public function messages(): array 
    {
        return [
            'building.string' => 'The building name must be a valid string.',
            'building.max' => 'The building name may not be greater than 255 characters.',

            'unit_or_department.string' => 'The unit or department must be a valid string.',
            'unit_or_department.max' => 'The unit or department may not be greater than 255 characters.',

            'building_room.string' => 'The building room must be a valid string.',
            'building_room.max' => 'The building room may not be greater than 255 characters.',

            'date_purchased.required' => 'Please provide the date the asset was purchased.', // REQUIRED
            'date_purchased.date' => 'The date purchased must be a valid date.',

            'asset_type.required' => 'Please provide the asset type.',                      // REQUIRED
            'asset_type.string' => 'The asset type must be a valid string.',
            'asset_type.max' => 'The asset type may not be greater than 255 characters.',

            'asset_name.required' => 'Please provide the asset name.',                      // REQUIRED
            'asset_name.string' => 'The asset name must be a valid string.',
            'asset_name.max' => 'The asset name may not be greater than 255 characters.',

            'brand.required' => 'Please provide the brand of the asset.',                   // REQUIRED
            'brand.string' => 'The brand must be a valid string.',
            'brand.max' => 'The brand may not be greater than 255 characters.',

            'quantity.required' => 'Please enter the quantity.',                            // REQUIRED
            'quantity.integer' => 'The quantity must be a whole number.',
            'quantity.min' => 'The quantity must be at least 1.',
            'quantity.max' => 'The quantity may not be more than 1000.',

            'supplier.required' => 'Please provide the supplier name.',                     // REQUIRED
            'supplier.string' => 'The supplier must be a valid string.',
            'supplier.max' => 'The supplier may not be greater than 255 characters.',

            'unit_cost.required' => 'Please provide the unit cost.',                        // REQUIRED
            'unit_cost.numeric' => 'The unit cost must be a valid number.',
            'unit_cost.min' => 'The unit cost must be at least 0.',
            'unit_cost.max' => 'The unit cost may not exceed 999,999.99.',

            'serial_no.required' => 'Please provide the serial number.',                    // REQUIRED
            'serial_no.numeric' => 'The serial number must be a valid number.',
            'serial_no.min' => 'The serial number must be at least 0.',

            'asset_model_id.numeric' => 'The asset model must be a valid number.',
            // 'asset_model.max' => 'The asset model may not be greater than 255 characters.',

            'transfer_status.string' => 'The transfer status must be a valid string.',
            'transfer_status.max' => 'The transfer status may not be greater than 255 characters.',

            'description.string' => 'The description must be a valid string.',
            'description.max' => 'The description may not be greater than 1000 characters.',

            'memorandum_no.required' => 'Please provide the memorandum number.',            // REQUIRED
            'memorandum_no.numeric' => 'The memorandum number must be a valid number.',
            'memorandum_no.min' => 'The memorandum number must be at least 0.',
        ];
    }


}
