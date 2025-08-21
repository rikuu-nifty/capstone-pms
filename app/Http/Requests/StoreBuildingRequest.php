<?php 
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gate/auth as you need
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $code = $this->input('code');
        $description = $this->input('description');
        $rooms = $this->input('rooms', []);

        // Keep only rooms that have a non-empty 'room'
        if (is_array($rooms)) {
            $rooms = collect($rooms)
                ->map(function ($r) {
                    return [
                        'room' => isset($r['room']) ? trim((string) $r['room']) : '',
                        'description' => isset($r['description']) && strlen(trim((string) $r['description'])) > 0
                            ? trim((string) $r['description'])
                            : null,
                    ];
                })
                ->filter(fn ($r) => $r['room'] !== '')
                ->values()
                ->all();
        } else {
            $rooms = [];
        }

        $this->merge([
            'name' => is_string($name) ? trim($name) : $name,
            'code' => is_string($code) ? strtoupper(trim($code)) : $code,
            'description' => (is_string($description) && trim($description) === '') ? null : $description,
            'rooms' => $rooms,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            // Unique considering soft deletes (matches our composite unique index)
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('buildings')->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],

            // Optional array of rooms
            'rooms' => ['sometimes', 'array'],
            'rooms.*.room' => ['required', 'string', 'max:128', 'distinct:strict'], // Block duplicate room names **in the same submit**
            'rooms.*.description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'rooms.*.room.distinct' => 'Duplicate room names are not allowed in one submission.',
        ];
    }
}
