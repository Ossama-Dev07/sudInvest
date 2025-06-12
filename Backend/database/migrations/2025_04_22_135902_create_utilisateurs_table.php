<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('nom_utilisateur');
            $table->string('prenom_utilisateur');
            $table->string('password');
            $table->string('CIN_utilisateur')->unique();
            $table->string('Ntele_utilisateur')->nullable();
            $table->string('email_utilisateur')->unique();
            $table->date('dateIntri_utilisateur')->default(now());
            $table->date('archived_at')->nullable();
            $table->text('adresse_utilisateur')->
            nullable();
            $table->enum('role_utilisateur', ['admin', 'consultant']);
            $table->enum('statut_utilisateur', ['actif', 'inactif'])->default('actif');
            $table->dateTime('last_active')->nullable();
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
