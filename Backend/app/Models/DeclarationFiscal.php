<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeclarationFiscal extends Model
{
    use HasFactory;

    protected $fillable = [
        'dateDeclaration',
        'montant_declare',
        'statut_declaration',
        'id_HFiscal',
        'type_declaration',
        'annee_declaration',
        'date_limite',
        'obligatoire',
        'commentaire'
    ];

    protected $casts = [
        'dateDeclaration' => 'date',
        'date_limite' => 'date',
        'montant_declare' => 'decimal:2',
        'obligatoire' => 'boolean',
    ];

    // Relationships
    public function historiqueFiscal()
    {
        return $this->belongsTo(HistoriqueFiscal::class, 'id_HFiscal');
    }
}

