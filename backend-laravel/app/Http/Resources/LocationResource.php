<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'adresse' => $this->adresse,
            'code_postal' => $this->code_postal,
            'ville' => $this->ville,
            'type' => $this->type,
            'niveau' => $this->niveau,
            'telephone' => $this->telephone,
            'contact' => $this->contact,
            'email' => $this->email,
            'commentaire' => $this->commentaire,
            'lat' => $this->lat,
            'lon' => $this->lon,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
