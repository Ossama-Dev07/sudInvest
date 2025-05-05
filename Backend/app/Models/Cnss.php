<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cnss extends Model
{
    use HasFactory;
    protected $fillable = ['code_cnss', 'date_en', 'description','statut', 'id_client'];
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

}
