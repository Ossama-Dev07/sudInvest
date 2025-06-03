<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AGO extends Model
{
    use HasFactory;
    protected $table = 'agos';

    protected $fillable = [
        'id_client',
        'ago_date',
        'annee',
        'decision_type',
        'ran_amount',
        'tpa_amount',
        'dividendes_nets',
        'commentaire'
    ];

    protected $casts = [
        'ago_date' => 'date',
        'ran_amount' => 'decimal:2',
        'tpa_amount' => 'decimal:2',
        'dividendes_nets' => 'decimal:2',
    ];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }

    public function etapes()
    {
        return $this->hasMany(EtapAgo::class, 'id_ago');
    }
}
