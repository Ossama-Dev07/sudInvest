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
        Schema::create('archived_utilisateurs', function (Blueprint $table) {
            $table->unsignedBigInteger('id_utilisateur')->primary();
            $table->string('nom_utilisateur');
            $table->string('prenom_utilisateur');
            $table->string('password');
            $table->string('CIN_utilisateur')->unique();
            $table->string('Ntele_utilisateur')->nullable();
            $table->string('email_utilisateur')->unique();
            $table->date('dateIntri_utilisateur')->default(now());
            $table->text('adresse_utilisateur');
            $table->enum('role_utilisateur', ['admin', 'consultant']);
            $table->enum('statut_utilisateur', ['actif', 'inactif'])->default('actif');
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_utilisateurs');
    }
};
