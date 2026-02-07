<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateLocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255',
            'adresse' => 'sometimes|string|max:500',
            'code_postal' => 'sometimes|string|max:10',
            'ville' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:100',
            'niveau' => 'nullable|string|max:20',
            'telephone' => 'nullable|string|max:50',
            'contact' => 'nullable|string|max:200',
            'email' => 'nullable|email|max:255',
            'commentaire' => 'nullable|string',
            'lat' => 'nullable|numeric|min:-90|max:90',
            'lon' => 'nullable|numeric|min:-180|max:180',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'adresse.max' => "L'adresse ne peut pas dépasser 500 caractères",
            'code_postal.max' => 'Le code postal ne peut pas dépasser 10 caractères',
            'ville.max' => 'La ville ne peut pas dépasser 100 caractères',
            'type.max' => 'Le type ne peut pas dépasser 100 caractères',
            'niveau.max' => 'Le niveau ne peut pas dépasser 20 caractères',
            'telephone.max' => 'Le téléphone ne peut pas dépasser 50 caractères',
            'contact.max' => 'Le contact ne peut pas dépasser 200 caractères',
            'email.email' => 'Email invalide',
            'email.max' => "L'email ne peut pas dépasser 255 caractères",
            'lat.numeric' => 'La latitude doit être un nombre',
            'lat.min' => 'La latitude doit être comprise entre -90 et 90',
            'lat.max' => 'La latitude doit être comprise entre -90 et 90',
            'lon.numeric' => 'La longitude doit être un nombre',
            'lon.min' => 'La longitude doit être comprise entre -180 et 180',
            'lon.max' => 'La longitude doit être comprise entre -180 et 180',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors()->all();

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'error' => 'Données invalides: ' . implode(', ', $errors),
            ], 400)
        );
    }
}
