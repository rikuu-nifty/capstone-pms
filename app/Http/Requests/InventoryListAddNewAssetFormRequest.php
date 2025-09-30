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
        $mode = $this->input('mode', 'single');

        return [
            'building_id'          => ['nullable', 'exists:buildings,id'],
            'unit_or_department_id'=> ['nullable', 'exists:unit_or_departments,id'],
            'building_room_id'     => ['nullable', 'exists:building_rooms,id'],
            'category_id'          => 'required|integer|exists:categories,id',
            'date_purchased'       => 'required|date',
            'asset_type'           => 'required|in:fixed,not_fixed',
            'asset_name'           => 'required|string|max:255',
            'brand'                => 'required|string|max:255',
            'quantity'             => 'required|integer|min:1|max:1000',
            'supplier'             => 'required|string|max:255',
            'unit_cost'            => 'required|numeric|min:0|max:999999.99',

            // ✅ Single mode: serial_no is required; Bulk mode: can be nullable
            // 'serial_no'     => 'required|string|max:255',
            'serial_no' => 'required_if:mode,single|nullable|string|max:255',

            // 🔹 Bulk mode
            'serial_numbers'       => $mode === 'bulk' ? 'required|array|min:1' : 'nullable|array',
            'serial_numbers.*'     => 'nullable|string|max:255',

            'asset_model_id' =>  'required|integer|max:255',
            // 🚫 removed transfer_status validation
            'description' =>     'nullable|string|max:1000',
            'memorandum_no' =>  'required|numeric|min:0',

            'status' => 'required|in:active,archived', // ✅ Validation for status

            // ✅ New: Image upload
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',

            // ✅ New: mode (single or bulk)
            'mode' => 'nullable|string|in:single,bulk',

            // ✅ New
            'depreciation_value' => 'nullable|numeric|min:0',

            // ✅ New
           'assigned_to' => 'nullable|exists:personnels,id',
        ];
    }


    /**
     * Function: Messages
     * @return array
     */
    public function messages(): array 
    {
        return [

            // ✅ Asset Category
'category_id.required' => 'Please select the asset category.',
'category_id.integer'  => 'The asset category must be a valid number.',
'category_id.exists'   => 'The selected asset category does not exist.',


// ✅ Serial Number
'serial_no.required' => 'Please provide the serial number of the asset.',
'serial_no.string'   => 'The serial number must be a valid string.',
'serial_no.max'      => 'The serial number may not be greater than 255 characters.',


// ✅ Unit Cost
'unit_cost.required' => 'Please provide the unit cost of the asset.',
'unit_cost.numeric'  => 'The unit cost must be a valid number.',
'unit_cost.min'      => 'The unit cost must be at least 0.',
'unit_cost.max'      => 'The unit cost may not exceed 999,999.99.',
            // 'building_id.required' => 'Please select a building.',
            'asset_model_id.required' => 'Please specify the model of the asset.',

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

            // 🔹 serial_no is not always required anymore (bulk mode can skip it)
            'serial_no.string' => 'The serial number must be a valid string.',
            'serial_no.max' => 'The serial number may not be greater than 255 characters.',

            'serial_numbers.array' => 'The serial numbers must be provided as an array.',
            'serial_numbers.*.string' => 'Each serial number must be a valid string.',
            'serial_numbers.*.max' => 'Each serial number may not be greater than 255 characters.',

            'asset_model_id.numeric' => 'The asset model must be a valid number.',

            // 🚫 removed transfer_status messages

            'description.string' => 'The description must be a valid string.',
            'description.max' => 'The description may not be greater than 1000 characters.',

            'memorandum_no.required' => 'Please provide the memorandum number.',            // REQUIRED
            'memorandum_no.numeric' => 'The memorandum number must be a valid number.',
            'memorandum_no.min' => 'The memorandum number must be at least 0.',

            // ✅ Depreciation Value
            'depreciation_value.numeric' => 'The depreciation value must be a valid number.',
            'depreciation_value.min'     => 'The depreciation value must be at least 0.',

            // ✅ Assigned To
            'assigned_to.string' => 'The assigned to field must be a valid string.',
            'assigned_to.max'    => 'The assigned to field may not be greater than 255 characters.',

            // ✅ Image messages
            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif.',
            'image.max' => 'The image may not be greater than 5MB.',

            // ✅ Mode messages
            'mode.in' => 'The mode must be either single or bulk.',

            // ✅ Status messages
            'status.required' => 'Please select the status of the asset.',
            'status.in' => 'The status must be either Active or Archived.',

            'asset_type.required' => 'Please select the type of asset.',
            'asset_type.in'       => 'The asset type must be either Fixed or Not Fixed.',
           
        ];
    }
}
