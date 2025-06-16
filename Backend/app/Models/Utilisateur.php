<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use App\Notifications\ResetPasswordNotification;

class Utilisateur extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    protected $table = 'utilisateurs';
    protected $primaryKey = 'id_utilisateur';

    protected $fillable = [
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
        'last_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'dateIntri_utilisateur' => 'date',
        'last_active' => 'datetime',
        'password' => 'hashed',
    ];

    // Override methods for password reset functionality
    public function getEmailForPasswordReset()
    {
        return $this->email_utilisateur;
    }

    public function getAuthIdentifierName()
    {
        return 'id_utilisateur';
    }

    public function getAuthIdentifier()
    {
        return $this->id_utilisateur;
    }

    public function getAuthPassword()
    {
        return $this->password;
    }

    // Add relationship methods if needed
    public function clients()
    {
        return $this->hasMany(Client::class, 'id_utilisateur', 'id_utilisateur');
    }

    // Send the password reset notification
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}