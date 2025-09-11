<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBuildingRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('buildingRoom')->id;

        return [
            'building_id' => [ 'required', 'integer', Rule::exists('buildings', 'id')->whereNull('deleted_at'), ],
            'room' => [ 'required', 'string', 'max:255',
                Rule::unique('building_rooms', 'room')
                    ->ignore($id)
                    ->where(fn ($q) => $q
                        ->whereNull('deleted_at')
                        ->where('building_id', $this->integer('building_id'))
                    ),
            ],

            'description' => ['nullable', 'string', 'max:1000'],

            'sub_areas' => ['nullable', 'array'],
            'sub_areas.*.id' => ['nullable', 'exists:sub_areas,id'],
            'sub_areas.*.name' => ['required_with:sub_areas', 'string', 'max:255'],
            'sub_areas.*.description' => ['nullable', 'string', 'max:1000'],
            'remove_sub_area_ids' => ['nullable', 'array'],
            'remove_sub_area_ids.*' => ['integer', 'exists:sub_areas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'room.unique' => 'This room name already exists for the selected building.',
        ];
    }
}
