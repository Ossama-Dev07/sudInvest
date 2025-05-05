<?php


class Utilisateur extends Model
{
    use HasFactory;

    protected $table = 'utilisateurs';

    protected $primaryKey = 'id_utilisateur';

    protected $fillable = [
        'nom_utilisateur',
        'prenom_utilisateur',
        'CIN_utilisateur',
        'Ntele_utilisateur',
        'email_utilisateur',
        'adresse_utilisateur',
        'dateInit_utilisateur',
        'role_utilisateur',
        'statut_utilisateur',
        'password'
    ];

    public function clients()
    {
        return $this->hasMany(Client::class, 'id_utilisateur');
    }
}