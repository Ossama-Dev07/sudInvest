<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('etapes_juridiques', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_historique');
            $table->string('titre');
            $table->enum('statut', ['oui', 'non'])->default('non');
            $table->text('commentaire')->nullable();
            $table->timestamps(); 
            $table->foreign('id_historique')
                  ->references('id')
                  ->on('historique_juridiques')
                  ->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etapes_juridiques');
    }
};
