<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoriqueFiscal extends Model
{
    use HasFactory;

    protected $fillable = ['datecreation', 'anne_fiscal', 'description', 'id_client'];

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function paiements()
    {
        return $this->hasMany(PaiementFiscal::class, 'id_HFiscal');
    }

    public function declarations()
    {
        return $this->hasMany(DeclarationFiscal::class, 'id_HFiscal');
    }
}
