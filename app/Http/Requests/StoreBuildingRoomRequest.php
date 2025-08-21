<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBuildingRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // add auth/permission checks if needed
    }

    public function rules(): array
    {
        return [
            'building_id' => [
                'required',
                'integer',
                Rule::exists('buildings', 'id')->whereNull('deleted_at'),
            ],
            'room' => [
                'required',
                'string',
                'max:255',
                // Unique within the same building among active rows
                Rule::unique('building_rooms', 'room')
                    ->where(fn ($q) => $q
                        ->whereNull('deleted_at')
                        ->where('building_id', $this->integer('building_id'))
                    ),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'room.unique' => 'This room name already exists for the selected building.',
        ];
    }
}
