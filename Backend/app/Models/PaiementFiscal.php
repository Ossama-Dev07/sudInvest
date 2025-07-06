<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaiementFiscal extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_paiement',
        'montant_paye',
        'id_HFiscal',
        'type_impot',
        'periode',
        'periode_numero',
        'montant_du',
        'date_echeance',  
        'date_start',  
        'date_end',  
        'statut',
        'commentaire'
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'date_echeance' => 'date',
        'montant_paye' => 'decimal:2',
        'montant_du' => 'decimal:2',
    ];

    // Relationships
    public function historiqueFiscal()
    {
        return $this->belongsTo(HistoriqueFiscal::class, 'id_HFiscal');
    }
}