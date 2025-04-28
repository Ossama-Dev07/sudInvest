<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaiementFiscal extends Model
{
    use HasFactory;

    protected $fillable = ['date_paiement', 'montant_paye', 'id_HFiscal'];

    public function historiqueFiscal()
    {
        return $this->belongsTo(HistoriqueFiscal::class, 'id_HFiscal');
    }
}

