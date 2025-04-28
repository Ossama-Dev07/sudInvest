<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeclarationFiscal extends Model
{
    use HasFactory;

    protected $fillable = ['dateDeclaration', 'montant_declare', 'statut_declaration', 'id_HFiscal'];

    public function historiqueFiscal()
    {
        return $this->belongsTo(HistoriqueFiscal::class, 'id_HFiscal');
    }
}

