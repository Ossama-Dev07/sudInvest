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
                Schema::create('clients', function (Blueprint $table) {

            $table->id('id_client');
            $table->unsignedBigInteger('id_fiscal');
            $table->string('nom_client')->nullable();
            $table->string('prenom_client')->nullable();
            $table->string('raisonSociale')->nullable();
            $table->string('CIN_client');
            $table->string('rc');
            $table->string('telephone')->nullable();
            $table->enum('type',['pp','pm'])->default('pp');
            $table->string('email');
            $table->text('adresse')->nullable();
            $table->date('datecreation');
            $table->date('date_collaboration')->nullable();
            $table->string('ice')->nullable();
            $table->string('taxe_profes')->nullable();
            $table->string('activite');
            $table->enum('statut_client',["actif",'inactif'])->default('actif');
            $table->foreignId('id_utilisateur')->constrained('utilisateurs', 'id_utilisateur')->onDelete('cascade');
            $table->timestamps();
                });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
