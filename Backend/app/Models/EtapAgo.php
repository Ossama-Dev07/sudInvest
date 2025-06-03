<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtapAgo extends Model
{
    use HasFactory;
    protected $table = 'etap_agos';

    protected $fillable = [
        'id_ago',
        'titre',
        'statut'
    ];

    // Relations
    public function ago()
    {
        return $this->belongsTo(AGO::class, 'id_ago');
    }
}
