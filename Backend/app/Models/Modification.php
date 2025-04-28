<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Modification extends Model
{
    use HasFactory;

    protected $fillable = ['date_modification', 'objet', 'Montant', 'id_HJuridique'];

    public function historiqueJuridique()
    {
        return $this->belongsTo(HistoriqueJuridique::class, 'id_HJuridique');
    }
}

