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
        Schema::create('paiement_fiscals', function (Blueprint $table) {
            $table->id();
            $table->date('date_paiement');
            $table->decimal('montant_paye', 10, 2);
            
            // NEW FIELDS we're adding for VERSEMENTS:
            $table->string('type_impot', 100);
            $table->enum('periode', ['MENSUEL', 'TRIMESTRIEL', 'ANNUEL']);
            $table->integer('periode_numero')->nullable(); // Month (1-12) or Period (1-4)
            $table->decimal('montant_du', 15, 2)->nullable(); // Amount due
            $table->date('date_echeance')->nullable(); // Due date
            $table->enum('statut', ['NON_PAYE', 'PAYE', 'EN_RETARD', 'PARTIEL'])->default('NON_PAYE');
            $table->text('commentaire')->nullable();
            
            $table->foreignId('id_HFiscal')->constrained('historique_fiscals', 'id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiement_fiscals');
    }
};