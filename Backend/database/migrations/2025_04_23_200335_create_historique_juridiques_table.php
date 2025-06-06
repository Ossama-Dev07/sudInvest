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
        Schema::create('historique_juridiques', function (Blueprint $table) {
            $table->id();
            $table->date('date_modification');
            $table->text('description')->nullable(); 
            $table->string('objet');
            $table->decimal('montant', 10, 2); 
            $table->decimal('debours', 10, 2)->nullable(); 
            $table->foreignId('id_client')->constrained('clients', 'id_client')->onDelete('cascade');
            $table->timestamps();
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_juridiques');
    }
};
