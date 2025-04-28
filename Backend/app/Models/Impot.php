<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Impot extends Model
{
    use HasFactory;

    protected $fillable = ['code_impot', 'type_impot', 'date_impot', 'id_client'];

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }
}

