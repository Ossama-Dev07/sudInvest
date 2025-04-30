<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedUtilisateur extends Model
{
    protected $table = 'archived_utilisateurs';
    protected $primaryKey = 'id_utilisateur'; 

    protected $fillable = [
        'id_utilisateur',
        'nom_utilisateur',
        'prenom_utilisateur',
        'password',
        'CIN_utilisateur',
        'Ntele_utilisateur',
        'email_utilisateur',
        'dateIntri_utilisateur',
        'adresse_utilisateur',
        'role_utilisateur',
        'statut_utilisateur',
        'archived_at'
    ];
}
