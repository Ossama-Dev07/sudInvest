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
        Schema::create('historique_fiscals', function (Blueprint $table) {
            $table->id();
            $table->date('datecreation');
            $table->string('annee_fiscal');
            $table->text('description')->nullable();
            
            // NEW FIELDS we're adding:
            $table->enum('statut_global', ['EN_COURS', 'COMPLETE', 'EN_RETARD'])->default('EN_COURS');
            $table->text('commentaire_general')->nullable();
            
            $table->foreignId('id_client')->constrained('clients', 'id_client')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_fiscals');
    }
};