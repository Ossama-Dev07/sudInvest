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
