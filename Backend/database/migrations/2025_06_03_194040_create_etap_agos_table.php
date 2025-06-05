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
        Schema::create('etap_agos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_ago');
            $table->string('titre');
            $table->enum('statut', ['oui', 'non'])->default('non');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            // Foreign key
            $table->foreign('id_ago')->references('id')->on('agos')->onDelete('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etap_agos');
    }
};
