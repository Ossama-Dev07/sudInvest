<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; 
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Utilisateur extends Authenticatable 
{
    
    use HasApiTokens, HasFactory; 

    protected $table = 'utilisateurs';

    protected $primaryKey = 'id_utilisateur';

    protected $fillable = [
        'id_utilisateur',
        'nom_utilisateur',
        'prenom_utilisateur',
        'CIN_utilisateur',
        'Ntele_utilisateur',
        'email_utilisateur',
        'adresse_utilisateur',
        'dateInit_utilisateur',
        'role_utilisateur',
        'statut_utilisateur',
        'archived_at',
        'password',
        'last_active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function clients()
    {
        return $this->hasMany(Client::class, 'id_utilisateur');
    }

    public function LogsAction(): HasMany
    {
        return $this->hasMany(LogsAction::class, 'id_utilisateur', 'id_utilisateur');
    }
}
