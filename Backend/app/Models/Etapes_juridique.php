<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etapes_juridique extends Model
{
    use HasFactory;
    protected $fillable = [
        'id_historique',
        'titre',
        'statut',
        'commentaire'
    ];

    // Relationship to HistoriqueJuridique
    public function historiqueJuridique()
    {
        return $this->belongsTo(HistoriqueJuridique::class, 'id_historique', 'id');
    }
}
