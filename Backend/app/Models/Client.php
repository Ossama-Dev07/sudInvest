<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_client';

    protected $fillable = [
        'id_fiscal', 'nom_client', 'prenom_client', 'raisonSociale', 'CIN_client', 'rc',
        'telephone','telephone2','type', 'email','email_2','adresse', 'datecreation', 'date_collaboration',
        'ice', 'taxe_profes', 'activite', 'statut_client', 'id_utilisateur'
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }

    public function historiqueJuridiques()
    {
        return $this->hasOne(HistoriqueJuridique::class, 'id_client');
    }

    public function historiqueFiscals()
    {
        return $this->hasMany(HistoriqueFiscal::class, 'id_client');
    }


    public function agos()
    {
        return $this->hasMany(AGO::class, 'id_client', 'id_client');
    }
}
