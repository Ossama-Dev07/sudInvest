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
            $table->string('CIN_client')->nullable();
            $table->string('rc');
            $table->string('telephone')->nullable();
            $table->string('telephone2')->nullable();
            $table->enum('type',['pp','pm'])->default('pp');
            $table->string('email');
            $table->string('email_2')->nullable();
            $table->text('adresse')->nullable();
            $table->date('datecreation');
            $table->date('date_collaboration')->nullable();
            $table->string('ice')->nullable();
            $table->string('taxe_profes')->nullable();
            $table->date('archived_at')->nullable();
            $table->string('activite')->nullable();
            $table->enum('statut_client',["actif",'inactif'])->default('actif');
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->onDelete('restrict');
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
