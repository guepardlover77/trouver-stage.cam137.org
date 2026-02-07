<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use SoftDeletes;
    /**
     * The table associated with the model.
     */
    protected $table = 'locations';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'adresse',
        'code_postal',
        'ville',
        'type',
        'niveau',
        'telephone',
        'contact',
        'email',
        'commentaire',
        'lat',
        'lon',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'lat' => 'float',
        'lon' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = true;

    /**
     * The storage format of the model's date columns.
     */
    protected $dateFormat = 'Y-m-d H:i:s';
}
