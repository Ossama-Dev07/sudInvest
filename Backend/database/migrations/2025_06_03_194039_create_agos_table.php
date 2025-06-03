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
        Schema::create('agos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_client');
            $table->date('ago_date');
            $table->year('annee');
            $table->enum('decision_type', ['RAN', 'DISTRIBUTION']);
            $table->decimal('ran_amount', 15, 2)->nullable();
            $table->decimal('tpa_amount', 15, 2)->nullable();
            $table->decimal('dividendes_nets', 15, 2)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            // Foreign key
            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agos');
    }
};
