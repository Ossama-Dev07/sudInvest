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
         Schema::create('modifications', function (Blueprint $table) {
            $table->id();
            $table->date('date_modification');
            $table->string('objet');
            $table->decimal('Montant', 10, 2);
            $table->foreignId('id_HJuridique')->constrained('historique_juridiques', 'id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modifications');
    }
};
