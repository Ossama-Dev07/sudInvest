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
        Schema::create('archived_clients', function (Blueprint $table) {
            $table->id('id_client');
            $table->unsignedBigInteger('id_fiscal');
            $table->string('nom_client');
            $table->string('prenom_client');
            $table->string('raisonSociale');
            $table->string('CIN_client');
            $table->string('rc');
            $table->string('telephone');
            $table->string('type');
            $table->string('email');
            $table->text('adresse');
            $table->date('datecreation');
            $table->date('date_collaboration')->nullable();
            $table->string('fax')->nullable();
            $table->string('ice')->nullable();
            $table->string('taxe_profes')->nullable();
            $table->string('activite');
            $table->string('cnss')->nullable();
            $table->enum('statut_client', ["actif", 'inactif'])->default('actif');
            $table->foreignId('id_utilisateur')->constrained('utilisateurs', 'id_utilisateur')->onDelete('cascade');
            $table->timestamp('archived_at')->nullable();
            $table->string('archived_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_clients');
    }
};
