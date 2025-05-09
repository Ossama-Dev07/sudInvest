<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriqueJuridique extends Model
{
    use HasFactory;

    protected $table = 'historique_juridiques';

    protected $fillable = [
        'date_modification',
        'annee_fiscal',
        'description',
        'objet',
        'montant',
        'id_client',
    ];

    // Relationship: Each historique belongs to a client
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }
}